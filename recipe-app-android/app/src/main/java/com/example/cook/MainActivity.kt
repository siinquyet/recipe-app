package com.example.cook

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.lifecycle.lifecycleScope
import com.example.cook.data.session.AuthGate
import com.example.cook.presentation.navigation.AppNavHost
import com.example.cook.ui.theme.CookTheme
import kotlinx.coroutines.launch
import org.koin.android.ext.android.inject

class MainActivity : ComponentActivity() {

    private val authGate: AuthGate by inject()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        lifecycleScope.launch { authGate.khoiTao() }
        setContent {
            CookTheme {
                AppNavHost(authGate = authGate)
            }
        }
    }
}
