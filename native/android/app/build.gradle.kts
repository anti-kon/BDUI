plugins {
  id("com.android.application")
  id("org.jetbrains.kotlin.android")
  id("org.jetbrains.kotlin.plugin.compose")
}

android {
  namespace = "dev.bdui.campus"
  compileSdk = 35

  defaultConfig {
    applicationId = "dev.bdui.campus"
    minSdk = 26
    targetSdk = 35
    versionCode = 1
    versionName = "0.6.0"
  }

  buildFeatures {
    buildConfig = true
    compose = true
  }

  compileOptions {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
  }

  flavorDimensions += "demo"
  productFlavors {
    create("campus") {
      dimension = "demo"
      applicationId = "dev.bdui.campus"
      resValue("string", "app_name", "Кампус")
      buildConfigField("String", "BDUI_CONTRACT", "\"campus.contract.json\"")
    }
    create("retail") {
      dimension = "demo"
      applicationId = "dev.bdui.lumamarket"
      resValue("string", "app_name", "Luma Market")
      buildConfigField("String", "BDUI_CONTRACT", "\"retail.contract.json\"")
    }
  }
}

kotlin {
  jvmToolchain(17)
}

dependencies {
  val composeBom = platform("androidx.compose:compose-bom:2025.01.00")
  implementation(composeBom)
  androidTestImplementation(composeBom)

  implementation("androidx.activity:activity-compose:1.10.0")
  implementation("androidx.compose.material3:material3")
  implementation("androidx.compose.ui:ui")
  implementation("androidx.compose.ui:ui-tooling-preview")
  debugImplementation("androidx.compose.ui:ui-tooling")
}
