# Recipe App Android

Ứng dụng Android chia sẻ công thức nấu ăn (Kotlin + Jetpack Compose)

## Tech Stack

- **Language**: Kotlin 1.9+
- **UI**: Jetpack Compose (Material3)
- **Architecture**: MVVM + Clean Architecture
- **DI**: Hilt
- **Network**: Retrofit + OkHttp + Kotlinx Serialization
- **Local DB**: Room
- **Navigation**: Navigation Compose
- **Image Loading**: Coil
- **Testing**: JUnit, MockK, Turbine, Compose Testing

## Cấu trúc Module

```
recipe-app-android/
├── app/
│   ├── src/main/java/com/example/cookbook/
│   │   ├── core/           # Shared utilities, base classes
│   │   ├── data/           # Repository implementations, data sources
│   │   ├── domain/         # Use cases, repository interfaces, models
│   │   ├── presentation/   # Screens, ViewModels, UI components
│   │   └── di/             # Hilt modules
│   ├── src/test/           # Unit tests
│   └── src/androidTest/    # Instrumented tests
├── build.gradle.kts
├── settings.gradle.kts
└── gradle.properties
```

## Quy tắc UI (Bắt buộc)

1. **Không hiển thị ID** - chỉ STT 1, 2, 3...
2. **Chữ căn trái** - `TextAlign.Start`
3. **Số căn phải** - `TextAlign.End` + format VN (`1.000`, `100.000`)

## Development

```bash
# From monorepo root
pnpm dev                    # Runs all apps
pnpm --filter=recipe-app-android build
```

## API Connection

App kết nối đến Backend API qua Retrofit:
- Base URL: `http://10.0.2.2:3000/api/v1` (emulator)
- Base URL: `http://localhost:3000/api/v1` (physical device with proxy)