package com.example.cook.core.util

import java.text.NumberFormat
import java.util.Locale

// BR-03/BR-04 dùng formatVn cho số lượng nguyên liệu
object NumberFormatUtils {

    private val dinhDangNguyen: NumberFormat = NumberFormat.getNumberInstance(Locale("vi", "VN")).apply {
        isGroupingUsed = true
        minimumFractionDigits = 0
        maximumFractionDigits = 0
    }

    private val dinhDangThapPhan: NumberFormat = NumberFormat.getNumberInstance(Locale("vi", "VN")).apply {
        isGroupingUsed = true
        minimumFractionDigits = 0
        maximumFractionDigits = 3
    }

    fun dinhDangSo(value: Number): String {
        val soThuc = value.toDouble()
        if (!soThuc.isFinite()) return "0"
        return if (soThuc % 1.0 == 0.0) {
            dinhDangNguyen.format(soThuc.toLong())
        } else {
            dinhDangThapPhan.format(soThuc)
        }
    }

    fun dinhDangSo(value: String): String {
        val so = value.toDoubleOrNull() ?: return "0"
        return dinhDangSo(so)
    }

    fun phanTichSo(value: String): Double {
        val daLamSach = value.replace(".", "")
        return daLamSach.toDoubleOrNull() ?: 0.0
    }
}

fun Number.dinhDangVn(): String = NumberFormatUtils.dinhDangSo(this)

fun Long.dinhDangVn(): String = NumberFormatUtils.dinhDangSo(this)

fun Double.dinhDangVn(): String = NumberFormatUtils.dinhDangSo(this)

fun Int.dinhDangVn(): String = NumberFormatUtils.dinhDangSo(this)
