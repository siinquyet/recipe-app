package com.example.cook

import android.app.Application
import org.koin.android.ext.koin.androidContext
import org.koin.core.context.startKoin
import org.koin.dsl.module

class CookApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin {
            androidContext(this@CookApplication)
            modules(diModule)
        }
    }
}

val diModule = module {
    // Modules sẽ được thêm sau
}