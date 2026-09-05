package com.example.cook.data.local

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.runBlocking

private val Context.dataStore by preferencesDataStore(name = "auth_prefs")

class TokenStorage(private val context: Context) {

    private val khoaAccessToken = stringPreferencesKey("access_token")
    private val khoaRefreshToken = stringPreferencesKey("refresh_token")

    val accessToken: Flow<String?> = context.dataStore.data.map { prefs ->
        prefs[khoaAccessToken]
    }

    val refreshToken: Flow<String?> = context.dataStore.data.map { prefs ->
        prefs[khoaRefreshToken]
    }

    fun layAccessToken(): String? = runBlocking { accessToken.first() }

    fun layRefreshToken(): String? = runBlocking { refreshToken.first() }

    suspend fun luuToken(accessToken: String, refreshToken: String) {
        context.dataStore.edit { prefs ->
            prefs[khoaAccessToken] = accessToken
            prefs[khoaRefreshToken] = refreshToken
        }
    }

    suspend fun xoaToken() {
        context.dataStore.edit { prefs ->
            prefs.remove(khoaAccessToken)
            prefs.remove(khoaRefreshToken)
        }
    }
}
