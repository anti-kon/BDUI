package dev.bdui.campus

import org.json.JSONObject
import kotlin.math.abs
import kotlin.math.ceil
import kotlin.math.floor
import kotlin.math.round

/**
 * Minimal expression evaluator mirroring the `@bdui/expr` semantics needed by
 * the prototype: interpolation, scalar lookup, arithmetic and boolean guards.
 */
internal object BduiExpression {
  private val interpolation = Regex("""\Q{{\E(.+?)\Q}}\E""")
  private val callName = Regex("""^[A-Za-z_][A-Za-z0-9_]*$""")

  fun interpolate(value: Any?, state: BduiState): String {
    val raw = resolve(value, state)
    if (raw !is String) return stringify(raw)
    return interpolation.replace(raw) { match ->
      stringify(evalScalar(match.groupValues[1].trim(), state))
    }
  }

  fun resolve(value: Any?, state: BduiState): Any? {
    val normalized = normalizeJson(value)
    if (normalized is JSONObject && normalized.optBoolean("__bduiExpr")) {
      return evalScalar(normalized.optString("code"), state)
    }
    if (normalized is String) {
      val match = interpolation.matchEntire(normalized.trim())
      if (match != null) return evalScalar(match.groupValues[1].trim(), state)
    }
    return normalized
  }

  fun evalBool(value: Any?, state: BduiState): Boolean {
    val code = expressionCode(value) ?: return false
    return evalOr(code, state)
  }

  private fun evalOr(code: String, state: BduiState): Boolean =
    split(code, "||").any { evalAnd(it, state) }

  private fun evalAnd(code: String, state: BduiState): Boolean =
    split(code, "&&").all { evalComparison(it, state) }

  private fun evalComparison(code: String, state: BduiState): Boolean {
    val operators = listOf("==", "!=", ">=", "<=", ">", "<")
    for (operator in operators) {
      val idx = code.indexOf(operator)
      if (idx > 0) {
        val left = evalScalar(code.substring(0, idx).trim(), state)
        val right = evalScalar(code.substring(idx + operator.length).trim(), state)
        return compare(left, right, operator)
      }
    }
    return truthy(evalScalar(code.trim(), state))
  }

  private fun evalScalar(code: String, state: BduiState): Any? {
    val trimmed = stripOuterParens(code.trim())
    if (trimmed.isBlank()) return ""
    if (trimmed == "true") return true
    if (trimmed == "false") return false
    if (trimmed == "null") return null
    if ((trimmed.startsWith("'") && trimmed.endsWith("'")) ||
      (trimmed.startsWith("\"") && trimmed.endsWith("\""))
    ) {
      return trimmed.substring(1, trimmed.length - 1)
    }
    trimmed.toDoubleOrNull()?.let { return it }
    parseCall(trimmed)?.let { return evalCall(it.first, it.second, state) }
    evalArithmetic(trimmed, state)?.let { return it }
    val dot = trimmed.indexOf('.')
    if (dot > 0) return state.read(trimmed.substring(0, dot), trimmed.substring(dot + 1))
    return trimmed
  }

  private fun evalCall(name: String, args: List<String>, state: BduiState): Any? {
    val values = args.map { evalScalar(it, state) }
    return when (name) {
      "len" -> values.firstOrNull().lengthValue()
      "max" -> values.map { it.asNumber(default = Double.NaN) }.maxOrNull()
      "min" -> values.map { it.asNumber(default = Double.NaN) }.minOrNull()
      "abs" -> abs(values.firstOrNull().asNumber(default = Double.NaN))
      "round" -> round(values.firstOrNull().asNumber(default = Double.NaN))
      "floor" -> floor(values.firstOrNull().asNumber(default = Double.NaN))
      "ceil" -> ceil(values.firstOrNull().asNumber(default = Double.NaN))
      "not" -> !truthy(values.firstOrNull())
      "isEmpty" -> values.firstOrNull().lengthValue() == 0
      "coalesce" -> values.firstOrNull { it != null }
      else -> null
    }
  }

  private fun evalArithmetic(code: String, state: BduiState): Double? {
    val expr = stripOuterParens(code)
    findTopLevelOperator(expr, charArrayOf('+', '-'))?.let { idx ->
      val left = evalScalar(expr.substring(0, idx), state).asNumber(default = Double.NaN)
      val right = evalScalar(expr.substring(idx + 1), state).asNumber(default = Double.NaN)
      return if (expr[idx] == '+') left + right else left - right
    }
    findTopLevelOperator(expr, charArrayOf('*', '/', '%'))?.let { idx ->
      val left = evalScalar(expr.substring(0, idx), state).asNumber(default = Double.NaN)
      val right = evalScalar(expr.substring(idx + 1), state).asNumber(default = Double.NaN)
      return when (expr[idx]) {
        '*' -> left * right
        '/' -> left / right
        else -> left % right
      }
    }
    return null
  }

  private fun compare(left: Any?, right: Any?, operator: String): Boolean {
    val lnum = left.asNumber(default = Double.NaN)
    val rnum = right.asNumber(default = Double.NaN)
    val numeric = !lnum.isNaN() && !rnum.isNaN()
    return when (operator) {
      "==" -> left == right || (numeric && lnum == rnum)
      "!=" -> left != right && (!numeric || lnum != rnum)
      ">" -> numeric && lnum > rnum
      "<" -> numeric && lnum < rnum
      ">=" -> numeric && lnum >= rnum
      "<=" -> numeric && lnum <= rnum
      else -> false
    }
  }

  private fun truthy(value: Any?): Boolean =
    when (value) {
      null -> false
      is Boolean -> value
      is Number -> value.toDouble() != 0.0
      is String -> value.isNotBlank()
      else -> true
    }

  private fun expressionCode(value: Any?): String? {
    val normalized = normalizeJson(value)
    if (normalized is JSONObject && normalized.optBoolean("__bduiExpr")) {
      return normalized.optString("code")
    }
    if (normalized is String) {
      val trimmed = normalized.trim()
      val match = interpolation.matchEntire(trimmed)
      return match?.groupValues?.get(1)?.trim() ?: trimmed
    }
    return null
  }

  private fun parseCall(code: String): Pair<String, List<String>>? {
    if (!code.endsWith(")")) return null
    val open = code.indexOf('(')
    if (open <= 0) return null
    val name = code.substring(0, open).trim()
    if (!callName.matches(name)) return null
    if (!outerParensWrap(code.substring(open))) return null
    val body = code.substring(open + 1, code.length - 1)
    return name to splitArgs(body)
  }

  private fun splitArgs(code: String): List<String> {
    if (code.isBlank()) return emptyList()
    val out = mutableListOf<String>()
    var depth = 0
    var quote: Char? = null
    var start = 0
    for (i in code.indices) {
      val c = code[i]
      if (quote != null) {
        if (c == quote) quote = null
        continue
      }
      when (c) {
        '\'', '"' -> quote = c
        '(' -> depth += 1
        ')' -> depth -= 1
        ',' -> if (depth == 0) {
          out.add(code.substring(start, i).trim())
          start = i + 1
        }
      }
    }
    out.add(code.substring(start).trim())
    return out
  }

  private fun findTopLevelOperator(code: String, operators: CharArray): Int? {
    var depth = 0
    var quote: Char? = null
    for (i in code.indices.reversed()) {
      val c = code[i]
      if (quote != null) {
        if (c == quote) quote = null
        continue
      }
      when (c) {
        '\'', '"' -> quote = c
        ')' -> depth += 1
        '(' -> depth -= 1
        else -> if (depth == 0 && operators.contains(c) && !isUnarySign(code, i)) return i
      }
    }
    return null
  }

  private fun isUnarySign(code: String, index: Int): Boolean {
    val c = code[index]
    if (c != '-' && c != '+') return false
    val prev = code.substring(0, index).lastOrNull { !it.isWhitespace() } ?: return true
    return prev == '(' || prev == ',' || prev == '+' || prev == '-' || prev == '*' ||
      prev == '/' || prev == '%'
  }

  private fun stripOuterParens(code: String): String {
    var current = code.trim()
    while (current.startsWith("(") && current.endsWith(")") && outerParensWrap(current)) {
      current = current.substring(1, current.length - 1).trim()
    }
    return current
  }

  private fun outerParensWrap(code: String): Boolean {
    var depth = 0
    var quote: Char? = null
    for (i in code.indices) {
      val c = code[i]
      if (quote != null) {
        if (c == quote) quote = null
        continue
      }
      when (c) {
        '\'', '"' -> quote = c
        '(' -> depth += 1
        ')' -> {
          depth -= 1
          if (depth == 0 && i != code.lastIndex) return false
        }
      }
    }
    return depth == 0
  }

  private fun split(code: String, delimiter: String): List<String> =
    code.split(delimiter).map { it.trim() }.filter { it.isNotEmpty() }

  private fun Any?.lengthValue(): Int =
    when (this) {
      null -> 0
      is String -> length
      is Collection<*> -> size
      is Map<*, *> -> size
      else -> toString().length
    }

  private fun stringify(value: Any?): String =
    when (value) {
      null -> ""
      is Number -> {
        val number = value.toDouble()
        if (!number.isNaN() && !number.isInfinite() && number % 1.0 == 0.0) {
          number.toLong().toString()
        } else {
          number.toString()
        }
      }
      else -> value.toString()
    }
}
