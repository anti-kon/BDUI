package dev.bdui.campus

import android.content.res.AssetManager
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Color as AndroidColor
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image as ComposeImage
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
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
import androidx.compose.material3.Typography
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.json.JSONArray
import org.json.JSONObject

class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    val contractText = assets.open(BuildConfig.BDUI_CONTRACT).bufferedReader().use { it.readText() }
    val contract = JSONObject(contractText)
    setContent {
      MaterialTheme(
        colorScheme = contract.colorScheme(),
        typography = Typography().withFontFamily(FontFamily.SansSerif),
      ) {
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

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun RenderNode(node: JSONObject?, runtime: BduiRuntime) {
  if (node == null) return
  when (node.optString("type")) {
    "Column" -> {
      val spacing = node.spacing()
      val modifiers = node.modifiers()
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .styledContainer(modifiers),
        verticalArrangement = Arrangement.spacedBy(spacing),
      ) {
        RenderChildren(node.optJSONArray("children"), runtime)
      }
    }
    "Row" -> {
      val modifiers = node.modifiers()
      val rowModifier = Modifier
        .fillMaxWidth()
        .styledContainer(modifiers)
      if (modifiers?.optString("flexWrap") == "wrap") {
        FlowRow(
          modifier = rowModifier,
          horizontalArrangement = Arrangement.spacedBy(node.spacing()),
          verticalArrangement = Arrangement.spacedBy(node.spacing()),
        ) {
          RenderChildren(node.optJSONArray("children"), runtime)
        }
      } else {
        Row(
          modifier = rowModifier,
          horizontalArrangement = node.horizontalArrangement(),
          verticalAlignment = node.verticalAlignment(),
        ) {
          RenderChildren(node.optJSONArray("children"), runtime)
        }
      }
    }
    "Text" -> {
      val modifiers = node.modifiers()
      val role = modifiers?.optString("role")
      var style = when (role) {
        "title" -> MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold)
        "section" -> MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold)
        "muted" -> MaterialTheme.typography.bodySmall.copy(color = MaterialTheme.colorScheme.onSurfaceVariant)
        "success" -> MaterialTheme.typography.bodyMedium.copy(color = MaterialTheme.colorScheme.primary)
        else -> MaterialTheme.typography.bodyLarge
      }
      modifiers?.fontSize()?.let { style = style.copy(fontSize = it.sp) }
      modifiers?.fontWeight()?.let { style = style.copy(fontWeight = it) }
      modifiers?.fontFamily()?.let { style = style.copy(fontFamily = it) }
      modifiers?.color("color")?.let { style = style.copy(color = it) }
      Text(
        text = BduiExpression.interpolate(node.opt("text") ?: node.opt("value"), runtime.state),
        style = style,
        modifier = Modifier.fillMaxWidth().padding(modifiers.textPadding()),
      )
    }
    "Button" -> {
      val title = BduiExpression.interpolate(node.opt("title"), runtime.state)
      val modifiers = node.modifiers()
      val primary = modifiers?.optString("variant") == "primary" ||
        node.optString("variant") == "primary"
      val shape = modifiers.shape(defaultRadius = if (primary) 12.0 else 12.0)
      val minHeight = modifiers?.dimensionDp("minHeight", 0.0) ?: 0.dp
      val buttonModifier = Modifier.heightIn(min = minHeight)
      val contentColor = modifiers?.color("color")
      if (primary) {
        val containerColor = modifiers?.color("background") ?: MaterialTheme.colorScheme.primary
        Button(
          modifier = buttonModifier,
          shape = shape,
          colors = ButtonDefaults.buttonColors(
            containerColor = containerColor,
            contentColor = contentColor ?: MaterialTheme.colorScheme.onPrimary,
          ),
          onClick = { runtime.runActions(node.optJSONArray("onAction")) },
        ) {
          Text(title)
        }
      } else {
        OutlinedButton(
          modifier = buttonModifier,
          shape = shape,
          border = modifiers.borderStroke(),
          colors = ButtonDefaults.outlinedButtonColors(
            containerColor = modifiers?.color("background") ?: Color.Transparent,
            contentColor = contentColor ?: MaterialTheme.colorScheme.onSurface,
          ),
          onClick = { runtime.runActions(node.optJSONArray("onAction")) },
        ) {
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
  val context = LocalContext.current
  val label = BduiExpression.interpolate(node.opt("alt") ?: node.opt("src"), runtime.state)
    .ifBlank { "Image" }
  val source = BduiExpression.interpolate(node.opt("src"), runtime.state)
  val bitmap = remember(source) { context.assets.loadBitmapOrNull(source) }
  val modifiers = node.modifiers()
  val shape = modifiers.shape(defaultRadius = 12.0)
  val imageModifier = Modifier
    .imageSize(node)
    .clip(shape)
    .then(modifiers.imageFrameModifier(shape))

  if (bitmap != null) {
    ComposeImage(
      bitmap = bitmap.asImageBitmap(),
      contentDescription = label,
      contentScale = if (node.optString("fit") == "cover") ContentScale.Crop else ContentScale.Fit,
      modifier = imageModifier,
    )
  } else {
    Surface(
      modifier = imageModifier,
      color = modifiers?.color("background") ?: MaterialTheme.colorScheme.primaryContainer,
      contentColor = MaterialTheme.colorScheme.onPrimaryContainer,
      shape = shape,
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

private fun JSONObject.colorScheme() =
  lightColorScheme(
    primary = themeColor("primary", Color(0xFF111827)),
    onPrimary = Color.White,
    background = themeColor("bg", Color(0xFFF8FAFC)),
    onBackground = themeColor("fg", Color(0xFF111111)),
    surface = Color.White,
    onSurface = themeColor("fg", Color(0xFF111111)),
  )

private fun JSONObject.themeColor(key: String, fallback: Color): Color =
  optJSONObject("theme")
    ?.optJSONObject("palette")
    ?.optJSONObject("light")
    ?.color(key)
    ?: fallback

private fun Typography.withFontFamily(fontFamily: FontFamily): Typography = copy(
  displayLarge = displayLarge.copy(fontFamily = fontFamily),
  displayMedium = displayMedium.copy(fontFamily = fontFamily),
  displaySmall = displaySmall.copy(fontFamily = fontFamily),
  headlineLarge = headlineLarge.copy(fontFamily = fontFamily),
  headlineMedium = headlineMedium.copy(fontFamily = fontFamily),
  headlineSmall = headlineSmall.copy(fontFamily = fontFamily),
  titleLarge = titleLarge.copy(fontFamily = fontFamily),
  titleMedium = titleMedium.copy(fontFamily = fontFamily),
  titleSmall = titleSmall.copy(fontFamily = fontFamily),
  bodyLarge = bodyLarge.copy(fontFamily = fontFamily),
  bodyMedium = bodyMedium.copy(fontFamily = fontFamily),
  bodySmall = bodySmall.copy(fontFamily = fontFamily),
  labelLarge = labelLarge.copy(fontFamily = fontFamily),
  labelMedium = labelMedium.copy(fontFamily = fontFamily),
  labelSmall = labelSmall.copy(fontFamily = fontFamily),
)

private fun AssetManager.loadBitmapOrNull(path: String): Bitmap? =
  try {
    open(path).use { BitmapFactory.decodeStream(it) }
  } catch (_: Exception) {
    null
  }

private fun JSONObject.modifiers(): JSONObject? = optJSONObject("modifiers")

private fun JSONObject.spacing(): Dp =
  modifiers().dimensionDp("gap", 10.0)

private fun JSONObject.horizontalArrangement() =
  when (modifiers()?.optString("justifyContent")) {
    "center" -> Arrangement.Center
    "flex-end", "end" -> Arrangement.End
    "space-between", "between" -> Arrangement.SpaceBetween
    "space-around", "around" -> Arrangement.SpaceAround
    else -> Arrangement.spacedBy(spacing())
  }

private fun JSONObject.verticalAlignment() =
  when (modifiers()?.optString("alignItems")) {
    "center" -> Alignment.CenterVertically
    "flex-end", "end" -> Alignment.Bottom
    else -> Alignment.Top
  }

private fun Modifier.styledContainer(modifiers: JSONObject?): Modifier {
  val shape = modifiers.shape()
  var next = this
  modifiers?.color("background")?.let { next = next.background(it, shape) }
  modifiers.borderStroke()?.let { next = next.border(it, shape) }
  return next.padding(modifiers.paddingValues())
}

private fun Modifier.imageSize(node: JSONObject): Modifier {
  val widthValue = node.opt("width")
  val withWidth = if (widthValue is String && widthValue.trim() == "100%") {
    fillMaxWidth()
  } else {
    width(widthValue.toDp(44.0))
  }
  return withWidth.height(node.opt("height").toDp(44.0))
}

private fun JSONObject?.imageFrameModifier(shape: Shape): Modifier {
  var next: Modifier = Modifier
  this?.color("background")?.let { next = next.background(it, shape) }
  borderStroke()?.let { next = next.border(it, shape) }
  return next
}

private fun JSONObject?.paddingValues(): PaddingValues {
  val raw = this?.opt("padding") ?: return PaddingValues(0.dp)
  val values = when (raw) {
    is Number -> listOf(raw.toDouble().dp)
    is String -> raw.split(Regex("\\s+")).filter { it.isNotBlank() }.map { it.toDp(0.0) }
    else -> emptyList()
  }
  return when (values.size) {
    1 -> PaddingValues(values[0])
    2 -> PaddingValues(vertical = values[0], horizontal = values[1])
    3 -> PaddingValues(top = values[0], end = values[1], bottom = values[2], start = values[1])
    4 -> PaddingValues(top = values[0], end = values[1], bottom = values[2], start = values[3])
    else -> PaddingValues(0.dp)
  }
}

private fun JSONObject?.textPadding(): PaddingValues =
  if (this?.has("padding") == true) paddingValues() else PaddingValues(0.dp)

private fun JSONObject?.dimensionDp(key: String, fallback: Double): Dp =
  this?.opt(key).toDp(fallback)

private fun Any?.toDp(fallback: Double): Dp = when (this) {
  is Number -> toDouble().toFloat().dp
  is String -> trim()
    .removeSuffix("px")
    .toFloatOrNull()
    ?.dp
    ?: fallback.toFloat().dp
  else -> fallback.toFloat().dp
}

private fun JSONObject?.shape(defaultRadius: Double = 0.0): Shape {
  val radius = dimensionDp("borderRadius", defaultRadius)
  return if (radius.value > 0f) RoundedCornerShape(radius) else RectangleShape
}

private fun JSONObject?.borderStroke(): BorderStroke? {
  val border = this?.optString("border").orEmpty()
  if (border.isBlank()) return null
  val color = parseCssColor(Regex("#[0-9a-fA-F]{6,8}|rgba?\\([^)]*\\)").find(border)?.value)
    ?: return null
  val width = Regex("(\\d+(?:\\.\\d+)?)px").find(border)?.groupValues?.get(1)?.toFloatOrNull()?.dp
    ?: 1.dp
  return BorderStroke(width, color)
}

private fun JSONObject.color(key: String): Color? =
  if (has(key)) parseCssColor(optString(key)) else null

private fun parseCssColor(raw: String?): Color? {
  if (raw.isNullOrBlank()) return null
  val value = raw.trim()
  if (value.startsWith("rgb")) {
    val parts = value
      .substringAfter("(")
      .substringBeforeLast(")")
      .split(",")
      .map { it.trim().toFloatOrNull() }
    if (parts.size >= 3 && parts[0] != null && parts[1] != null && parts[2] != null) {
      return Color(
        red = parts[0]!! / 255f,
        green = parts[1]!! / 255f,
        blue = parts[2]!! / 255f,
        alpha = parts.getOrNull(3) ?: 1f,
      )
    }
    return null
  }
  if (!value.startsWith("#")) return null
  return try {
    Color(AndroidColor.parseColor(value))
  } catch (_: IllegalArgumentException) {
    null
  }
}

private fun JSONObject.fontSize(): Float? = when (val value = opt("fontSize")) {
  is Number -> value.toFloat()
  is String -> value.removeSuffix("px").toFloatOrNull()
  else -> null
}

private fun JSONObject.fontWeight(): FontWeight? = when (val value = opt("fontWeight")) {
  is Number -> value.toInt().toFontWeight()
  is String -> value.toIntOrNull()?.toFontWeight()
  else -> null
}

private fun Int.toFontWeight(): FontWeight = when {
  this >= 900 -> FontWeight.Black
  this >= 800 -> FontWeight.ExtraBold
  this >= 700 -> FontWeight.Bold
  this >= 600 -> FontWeight.SemiBold
  this >= 500 -> FontWeight.Medium
  else -> FontWeight.Normal
}

private fun JSONObject.fontFamily(): FontFamily? {
  val family = optString("fontFamily").lowercase()
  return when {
    family.contains("mono") -> FontFamily.Monospace
    family.isNotBlank() -> FontFamily.SansSerif
    else -> null
  }
}

