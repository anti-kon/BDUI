package dev.bdui.campus

import androidx.compose.runtime.mutableStateMapOf
import org.json.JSONObject

/** Holds the three reactive state scopes (flow/session/local) backed by the contract's initial state. */
internal class BduiState(contract: JSONObject) {
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

  private fun mapFor(scope: String) =
    when (scope) {
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
