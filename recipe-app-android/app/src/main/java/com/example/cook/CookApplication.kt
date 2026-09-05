package com.example.cook

import android.app.Application
import com.example.cook.data.api.ApiService
import com.example.cook.data.local.TokenStorage
import com.example.cook.data.remote.AuthInterceptor
import com.example.cook.data.repository.AuthRepository
import com.example.cook.data.repository.RecipeRepository
import com.example.cook.data.session.AuthGate
import com.example.cook.presentation.auth.AuthViewModel
import com.example.cook.presentation.home.HomeViewModel
import com.example.cook.presentation.mealplan.MealPlanViewModel
import com.example.cook.presentation.recipe.RecipeDetailViewModel
import com.example.cook.presentation.search.SearchViewModel
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import org.koin.android.ext.koin.androidContext
import org.koin.androidx.viewmodel.dsl.viewModel
import org.koin.core.context.startKoin
import org.koin.dsl.module
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory
import java.util.concurrent.TimeUnit

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
    single { TokenStorage(androidContext()) }
    single { AuthGate(get()) }

    single { Json { ignoreUnknownKeys = true } }

    single {
        HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG) {
                HttpLoggingInterceptor.Level.BASIC
            } else {
                HttpLoggingInterceptor.Level.NONE
            }
        }
    }

    single { AuthInterceptor(get()) }

    single {
        OkHttpClient.Builder()
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .retryOnConnectionFailure(false)
            .addInterceptor(get<AuthInterceptor>())
            .addInterceptor(get<HttpLoggingInterceptor>())
            .build()
    }

    single<ApiService> {
        Retrofit.Builder()
            .baseUrl(com.example.cook.BuildConfig.BASE_URL)
            .client(get())
            .addConverterFactory(get<Json>().asConverterFactory("application/json".toMediaType()))
            .build()
            .create(ApiService::class.java)
    }
    single { AuthRepository(get(), get()) }
    single { RecipeRepository(get()) }
    viewModel { AuthViewModel(get()) }
    viewModel { HomeViewModel(get()) }
    viewModel { SearchViewModel(get()) }
    viewModel { MealPlanViewModel(get()) }
    viewModel { (handle: androidx.lifecycle.SavedStateHandle) -> RecipeDetailViewModel(get(), handle) }
}
