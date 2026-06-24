package dev.bdui.campus

import org.json.JSONArray
import org.json.JSONObject

/** Shared JSON coercion helpers used by the runtime, expression engine and renderer. */

internal fun normalizeJson(value: Any?): Any? = if (value == JSONObject.NULL) null else value

internal fun Any?.asNumber(default: Double = 0.0): Double =
  when (this) {
    is Number -> toDouble()
    is String -> toDoubleOrNull() ?: default
    else -> default
  }

internal fun JSONArray.findObject(predicate: (JSONObject) -> Boolean): JSONObject? {
  for (i in 0 until length()) {
    val item = optJSONObject(i) ?: continue
    if (predicate(item)) return item
  }
  return null
}
