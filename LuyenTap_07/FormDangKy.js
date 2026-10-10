import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { validateDangKy } from "./validation";

const FormDangKy = () => {
  const [hoTen, setHoTen] = useState("");
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [xacNhan, setXacNhan] = useState("");
  const [loi, setLoi] = useState({});
  const [thanhCong, setThanhCong] = useState(false);

  const guiForm = () => {
    const loiMoi = validateDangKy({ hoTen, email, matKhau, xacNhan });
    setLoi(loiMoi);
    setThanhCong(Object.keys(loiMoi).length === 0);
  };

  const oNhap = { borderWidth: 1, borderColor: "#999", borderRadius: 8, padding: 10, marginTop: 4 };
  const chuLoi = { color: "red", marginTop: 4 };

  return (
    <View style={{ padding: 16, gap: 4 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>Form đăng ký</Text>

      <TextInput value={hoTen} onChangeText={setHoTen} placeholder="Họ tên" style={oNhap} />
      {loi.hoTen ? <Text style={chuLoi}>{loi.hoTen}</Text> : null}

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        style={oNhap}
      />
      {loi.email ? <Text style={chuLoi}>{loi.email}</Text> : null}

      <TextInput
        value={matKhau}
        onChangeText={setMatKhau}
        placeholder="Mật khẩu"
        secureTextEntry
        style={oNhap}
      />
      {loi.matKhau ? <Text style={chuLoi}>{loi.matKhau}</Text> : null}

      <TextInput
        value={xacNhan}
        onChangeText={setXacNhan}
        placeholder="Nhập lại mật khẩu"
        secureTextEntry
        style={oNhap}
      />
      {loi.xacNhan ? <Text style={chuLoi}>{loi.xacNhan}</Text> : null}

      <View style={{ marginTop: 12 }}>
        <Button title="Submit" onPress={guiForm} />
      </View>
      {thanhCong ? (
        <Text style={{ marginTop: 12, fontSize: 16, color: "green" }}>Đăng ký thành công</Text>
      ) : null}
    </View>
  );
};

export default FormDangKy;
