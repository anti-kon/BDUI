package dev.bdui.campus

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Checkbox
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.json.JSONArray
import org.json.JSONObject

class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    val contractText = assets.open("campus.contract.json").bufferedReader().use { it.readText() }
    val contract = JSONObject(contractText)
    setContent {
      MaterialTheme(colorScheme = lightColorScheme()) {
        BduiApp(contract)
      }
    }
  }
}

@Composable
private fun BduiApp(contract: JSONObject) {
  val runtime = remember(contract) { BduiRuntime(contract) }
  val snackbarHostState = remember { SnackbarHostState() }
  val toast = runtime.toastMessage

  LaunchedEffect(toast) {
    if (!toast.isNullOrBlank()) {
      snackbarHostState.showSnackbar(toast)
      runtime.toastMessage = null
    }
  }

  Scaffold(snackbarHost = { SnackbarHost(snackbarHostState) }) { inner ->
    Surface(
      modifier = Modifier
        .fillMaxSize()
        .padding(inner),
      color = MaterialTheme.colorScheme.background,
    ) {
      BduiRoute(runtime)
    }
  }
}

private class BduiRuntime(private val contract: JSONObject) {
  val state = BduiState(contract)
  var currentRoute by mutableStateOf(
    contract.optJSONObject("navigation")?.optString("initialRoute").orEmpty(),
  )
  var toastMessage by mutableStateOf<String?>(null)
  private val backStack = mutableListOf(currentRoute)
  private val flowSteps = mutableStateMapOf<String, String>()

  fun currentRouteObject(): JSONObject? = findRoute(currentRoute)

  fun currentFlowStep(route: JSONObject): JSONObject? {
    val routeId = route.optString("id")
    val stepId = flowSteps[routeId] ?: route.optString("startStep")
    return route.optJSONArray("steps").findObject { it.optString("id") == stepId }
  }

  fun runActions(actions: JSONArray?) {
    if (actions == null) return
    for (i in 0 until actions.length()) {
      val action = actions.optJSONObject(i) ?: continue
      runAction(action)
    }
  }

  private fun runAction(action: JSONObject) {
    val type = action.optString("type")
    val params = action.optJSONObject("params") ?: JSONObject()
    when (type) {
      "navigate" -> navigate(params.optString("to"), params.optString("mode", "push"))
      "replace" -> navigate(params.optString("to"), "replace")
      "back" -> back()
      "popToRoot" -> popToRoot()
      "set" -> state.write(params.optJSONObject("target"), BduiExpression.resolve(params.opt("value"), state))
      "reset" -> state.write(params.optJSONObject("target"), null)
      "update.inc" -> {
        val target = params.optJSONObject("target")
        val current = state.read(target).asNumber()
        val by = BduiExpression.resolve(params.opt("by"), state).asNumber(default = 1.0)
        state.write(target, current + by)
      }
      "update.dec" -> {
        val target = params.optJSONObject("target")
        val current = state.read(target).asNumber()
        val by = BduiExpression.resolve(params.opt("by"), state).asNumber(default = 1.0)
        state.write(target, current - by)
      }
      "update.toggle" -> {
        val target = params.optJSONObject("target")
        state.write(target, !(state.read(target) as? Boolean ?: false))
      }
      "batch" -> runActions(params.optJSONArray("actions"))
      "when" -> {
        val branch = if (BduiExpression.evalBool(params.opt("if"), state)) {
          params.optJSONArray("then")
        } else {
          params.optJSONArray("else")
        }
        runActions(branch)
      }
      "toast" -> toastMessage = BduiExpression.interpolate(params.opt("message"), state)
      "flow.start" -> {
        val routeId = params.optString("routeId")
        val route = findRoute(routeId)
        if (route != null) flowSteps[routeId] = route.optString("startStep")
        navigate(routeId, "push")
      }
      "flow.goTo" -> {
        val routeId = params.optString("routeId", currentRoute)
        flowSteps[routeId] = params.optString("stepId")
      }
      "flow.complete", "flow.abort" -> flowSteps.remove(params.optString("routeId", currentRoute))
      "call" -> {
        val saveTo = params.optJSONObject("saveTo")
        if (saveTo != null) {
          state.write(saveTo, "native-ok")
        }
      }
    }
  }

  private fun navigate(routeId: String, mode: String) {
    if (routeId.isBlank()) return
    when (mode) {
      "replace" -> {
        if (backStack.isNotEmpty()) backStack.removeAt(backStack.lastIndex)
        backStack.add(routeId)
      }
      "popToRoot" -> {
        backStack.clear()
        backStack.add(routeId)
      }
      else -> backStack.add(routeId)
    }
    currentRoute = routeId
  }

  private fun back() {
    if (backStack.size > 1) {
      backStack.removeAt(backStack.lastIndex)
      currentRoute = backStack.last()
    }
  }

  private fun popToRoot() {
    val root = backStack.firstOrNull() ?: return
    backStack.clear()
    backStack.add(root)
    currentRoute = root
  }

  private fun findRoute(routeId: String): JSONObject? =
    contract.optJSONObject("navigation")
      ?.optJSONArray("routes")
      ?.findObject { it.optString("id") == routeId }
}

private class BduiState(contract: JSONObject) {
  private val flow = mutableStateMapOf<String, Any?>()
  private val session = mutableStateMapOf<String, Any?>()
  private val local = mutableStateMapOf<String, Any?>()

  init {
    val initial = contract.optJSONObject("initial")
    loadScope(initial?.optJSONObject("flow"), flow)
    loadScope(initial?.optJSONObject("session"), session)
  }

  fun read(target: JSONObject?): Any? {
    if (target == null) return null
    return mapFor(target.optString("scope"))[target.optString("path")]
  }

  fun read(scope: String, path: String): Any? = mapFor(scope)[path]

  fun write(target: JSONObject?, value: Any?) {
    if (target == null) return
    mapFor(target.optString("scope"))[target.optString("path")] = normalizeJson(value)
  }

  private fun mapFor(scope: String) = when (scope) {
    "session" -> session
    "local" -> local
    else -> flow
  }

  private fun loadScope(source: JSONObject?, dest: MutableMap<String, Any?>) {
    if (source == null) return
    val keys = source.keys()
    while (keys.hasNext()) {
      val key = keys.next()
      dest[key] = normalizeJson(source.opt(key))
    }
  }
}

private object BduiExpression {
  private val interpolation = Regex("\\{\\{([^}]+)\\}\\}")

  fun interpolate(value: Any?, state: BduiState): String {
    val raw = resolve(value, state)
    if (raw !is String) return raw?.toString().orEmpty()
    return interpolation.replace(raw) { match ->
      evalScalar(match.groupValues[1].trim(), state)?.toString().orEmpty()
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
    val trimmed = code.trim()
    if (trimmed == "true") return true
    if (trimmed == "false") return false
    if (trimmed == "null") return null
    if ((trimmed.startsWith("'") && trimmed.endsWith("'")) ||
      (trimmed.startsWith("\"") && trimmed.endsWith("\""))
    ) {
      return trimmed.substring(1, trimmed.length - 1)
    }
    if (trimmed.startsWith("len(") && trimmed.endsWith(")")) {
      val inner = trimmed.substring(4, trimmed.length - 1)
      return evalScalar(inner, state)?.toString()?.length ?: 0
    }
    trimmed.toDoubleOrNull()?.let { return it }
    val dot = trimmed.indexOf('.')
    if (dot > 0) return state.read(trimmed.substring(0, dot), trimmed.substring(dot + 1))
    return trimmed
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

  private fun truthy(value: Any?): Boolean = when (value) {
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

  private fun split(code: String, delimiter: String): List<String> =
    code.split(delimiter).map { it.trim() }.filter { it.isNotEmpty() }
}

@Composable
private fun BduiRoute(runtime: BduiRuntime) {
  val route = runtime.currentRouteObject()
  if (route == null) {
    Text("Route not found: ${runtime.currentRoute}", modifier = Modifier.padding(20.dp))
    return
  }
  if (route.optString("type") == "flow") {
    val step = runtime.currentFlowStep(route)
    Column(
      modifier = Modifier
        .fillMaxSize()
        .verticalScroll(rememberScrollState()),
    ) {
      RenderChildren(step?.optJSONArray("children"), runtime)
    }
  } else {
    Column(
      modifier = Modifier
        .fillMaxSize()
        .verticalScroll(rememberScrollState()),
    ) {
      RenderNode(route.optJSONObject("node"), runtime)
    }
  }
}

@Composable
private fun RenderNode(node: JSONObject?, runtime: BduiRuntime) {
  if (node == null) return
  when (node.optString("type")) {
    "Column" -> {
      val spacing = node.spacing()
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .padding(node.padding()),
        verticalArrangement = Arrangement.spacedBy(spacing),
      ) {
        RenderChildren(node.optJSONArray("children"), runtime)
      }
    }
    "Row" -> {
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .padding(node.padding()),
        horizontalArrangement = Arrangement.spacedBy(node.spacing()),
      ) {
        RenderChildren(node.optJSONArray("children"), runtime)
      }
    }
    "Text" -> {
      val role = node.optJSONObject("modifiers")?.optString("role")
      val style = when (role) {
        "title" -> MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold)
        "section" -> MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold)
        "muted" -> MaterialTheme.typography.bodySmall.copy(color = MaterialTheme.colorScheme.onSurfaceVariant)
        "success" -> MaterialTheme.typography.bodyMedium.copy(color = MaterialTheme.colorScheme.primary)
        else -> MaterialTheme.typography.bodyLarge
      }
      Text(
        text = BduiExpression.interpolate(node.opt("text") ?: node.opt("value"), runtime.state),
        style = style,
        modifier = Modifier.fillMaxWidth(),
      )
    }
    "Button" -> {
      val title = BduiExpression.interpolate(node.opt("title"), runtime.state)
      val primary = node.optJSONObject("modifiers")?.optString("variant") == "primary" ||
        node.optString("variant") == "primary"
      if (primary) {
        Button(onClick = { runtime.runActions(node.optJSONArray("onAction")) }) {
          Text(title)
        }
      } else {
        OutlinedButton(onClick = { runtime.runActions(node.optJSONArray("onAction")) }) {
          Text(title)
        }
      }
    }
    "Input" -> {
      val binding = node.optJSONObject("binding")
      val value = runtime.state.read(binding)?.toString().orEmpty()
      OutlinedTextField(
        value = value,
        onValueChange = { runtime.state.write(binding, it) },
        label = { Text(BduiExpression.interpolate(node.opt("placeholder"), runtime.state)) },
        keyboardOptions = KeyboardOptions(
          keyboardType = if (node.optString("inputType") == "number") KeyboardType.Number else KeyboardType.Text,
        ),
        modifier = Modifier.fillMaxWidth(),
      )
    }
    "Checkbox" -> {
      val binding = node.optJSONObject("binding")
      val checked = runtime.state.read(binding) as? Boolean ?: false
      Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        Checkbox(
          checked = checked,
          onCheckedChange = { runtime.state.write(binding, it) },
        )
        Text(BduiExpression.interpolate(node.opt("label"), runtime.state))
      }
    }
    "Image" -> ImageNode(node, runtime)
    "Select" -> SelectNode(node, runtime)
    "If" -> if (BduiExpression.evalBool(node.opt("condition"), runtime.state)) {
      RenderChildren(node.optJSONArray("children"), runtime)
    }
    "Divider" -> HorizontalDivider(modifier = Modifier.padding(vertical = 4.dp))
    else -> Text("Unsupported node: ${node.optString("type")}")
  }
}

@Composable
private fun ImageNode(node: JSONObject, runtime: BduiRuntime) {
  val label = BduiExpression.interpolate(node.opt("alt") ?: node.opt("src"), runtime.state)
    .ifBlank { "Image" }
  val modifiers = node.optJSONObject("modifiers")
  val radius = (modifiers?.optDouble("borderRadius", 12.0) ?: 12.0).toFloat().dp

  Surface(
    modifier = Modifier.size(
      width = node.dimension("width", 44.0),
      height = node.dimension("height", 44.0),
    ),
    color = MaterialTheme.colorScheme.primaryContainer,
    contentColor = MaterialTheme.colorScheme.onPrimaryContainer,
    shape = RoundedCornerShape(radius),
  ) {
    Box(contentAlignment = Alignment.Center) {
      Text(
        text = label.take(2).uppercase(),
        fontWeight = FontWeight.Bold,
        fontSize = 14.sp,
      )
    }
  }
}

@Composable
private fun SelectNode(node: JSONObject, runtime: BduiRuntime) {
  var expanded by remember { mutableStateOf(false) }
  val binding = node.optJSONObject("binding")
  val current = runtime.state.read(binding)?.toString().orEmpty()
  val options = node.optJSONArray("options") ?: JSONArray()
  val selected = options.findObject { it.opt("value")?.toString() == current }
  val label = selected?.optString("label")
    ?: BduiExpression.interpolate(node.opt("placeholder"), runtime.state).ifBlank { "Select" }

  Column {
    OutlinedButton(onClick = { expanded = true }, modifier = Modifier.fillMaxWidth()) {
      Text(label)
    }
    DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
      for (i in 0 until options.length()) {
        val option = options.optJSONObject(i) ?: continue
        DropdownMenuItem(
          text = { Text(BduiExpression.interpolate(option.opt("label"), runtime.state)) },
          onClick = {
            runtime.state.write(binding, normalizeJson(option.opt("value")))
            runtime.runActions(node.optJSONArray("onChangeAction"))
            expanded = false
          },
        )
      }
    }
  }
}

@Composable
private fun RenderChildren(children: JSONArray?, runtime: BduiRuntime) {
  if (children == null || children.length() == 0) {
    Spacer(Modifier.height(0.dp))
    return
  }
  for (i in 0 until children.length()) {
    RenderNode(children.optJSONObject(i), runtime)
  }
}

private fun JSONObject.spacing() =
  (optJSONObject("modifiers")?.optDouble("gap", 10.0) ?: 10.0).toFloat().dp

private fun JSONObject.padding() =
  (optJSONObject("modifiers")?.optDouble("padding", 0.0) ?: 0.0).toFloat().dp

private fun JSONObject.dimension(key: String, fallback: Double) =
  when (val value = opt(key)) {
    is Number -> value.toDouble().toFloat().dp
    is String -> value.removeSuffix("px").toFloatOrNull()?.dp ?: fallback.toFloat().dp
    else -> fallback.toFloat().dp
  }

private fun JSONArray.findObject(predicate: (JSONObject) -> Boolean): JSONObject? {
  for (i in 0 until length()) {
    val item = optJSONObject(i) ?: continue
    if (predicate(item)) return item
  }
  return null
}

private fun normalizeJson(value: Any?): Any? = if (value == JSONObject.NULL) null else value

private fun Any?.asNumber(default: Double = 0.0): Double = when (this) {
  is Number -> toDouble()
  is String -> toDoubleOrNull() ?: default
  else -> default
}
