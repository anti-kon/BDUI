package dev.bdui.campus

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import org.json.JSONArray
import org.json.JSONObject

/**
 * Drives navigation, the flow step machine and the SAL action dispatcher for
 * the prototype. State mutations flow through {@link BduiState} so Compose
 * recomposes automatically.
 */
internal class BduiRuntime(private val contract: JSONObject) {
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
    return route.optJSONArray("steps")?.findObject { it.optString("id") == stepId }
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
