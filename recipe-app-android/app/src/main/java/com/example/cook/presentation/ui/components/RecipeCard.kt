package com.example.cook.presentation.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.TextOverflow
import coil.compose.AsyncImage
import com.example.cook.ui.theme.CookTheme

data class CongThucCardData(
    val id: String,
    val hinhAnh: String?,
    val tenMon: String,
    val thoiGianNau: Int,
    val khauPhan: Int,
    val tacGia: String,
    val tacGiaAvatar: String?
)

@Composable
fun CongThucCard(
    duLieu: CongThucCardData,
    modifier: Modifier = Modifier,
    khiBam: () -> Unit = {}
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .padding(16.dp)
            .then(modifier),
        onClick = khiBam,
        elevation = androidx.compose.material3.CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Hình ảnh món ăn
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp)
                    .clip(RoundedCornerShape(topStart = 12.dp, topEnd = 12.dp))
            ) {
                duLieu.hinhAnh?.let { url ->
                    AsyncImage(
                        model = url,
                        contentDescription = duLieu.tenMon,
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop,
                        placeholder = androidx.compose.ui.res.painterResource(id = androidx.compose.ui.res.R.drawable.ic_launcher_background),
                        error = androidx.compose.ui.res.painterResource(id = androidx.compose.ui.res.R.drawable.ic_launcher_background)
                    )
                } ?: androidx.compose.ui.res.painterResource(id = androidx.compose.ui.res.R.drawable.ic_launcher_background)
            }

            // Thông tin món ăn
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(12.dp)
            ) {
                // Tên món
                BodyText(
                    text = duLieu.tenMon,
                    kichThuoc = 18.sp,
                    dam = true,
                    soDongToiDa = 2
                )

                androidx.compose.foundation.layout.Spacer(modifier = Modifier.padding(top = 8.dp))

                // Meta row: thời gian + khẩu phần + tác giả
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Thời gian nấu
                    Row(
                        modifier = Modifier.weight(1f),
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = androidx.compose.material.icons.Icons.Default.AccessTime,
                            contentDescription = "Thời gian nấu",
                            tint = CookTheme.colorScheme.onSurfaceVariant
                        )
                        BodyText(
                            text = "${duLieu.thoiGianNau} phút",
                            kichThuoc = 13.sp,
                            mau = CookTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    // Khẩu phần
                    Row(
                        modifier = Modifier.weight(1f),
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = androidx.compose.material.icons.Icons.Default.Restaurant,
                            contentDescription = "Khẩu phần",
                            tint = CookTheme.colorScheme.onSurfaceVariant
                        )
                        BodyText(
                            text = "${duLieu.khauPhan} người",
                            kichThuoc = 13.sp,
                            mau = CookTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    // Tác giả
                    Row(
                        modifier = Modifier.weight(1f),
                        horizontalArrangement = Arrangement.End,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        duLieu.tacGiaAvatar?.let { avatar ->
                            AsyncImage(
                                model = avatar,
                                contentDescription = duLieu.tacGia,
                                modifier = Modifier.size(20.dp).clip(androidx.compose.foundation.shape.CircleShape),
                                contentScale = ContentScale.Crop
                            )
                        }
                        BodyText(
                            text = duLieu.tacGia,
                            kichThuoc = 13.sp,
                            mau = CookTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }
    }
}