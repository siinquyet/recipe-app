import { useState } from "react";
import { Text, TextInput, View } from "react-native";

const NhapHoTen = () => {
  const [hoTen, setHoTen] = useState("");

  return (
    <View style={{ padding: 16 }}>
      <TextInput
        value={hoTen}
        onChangeText={setHoTen}
        placeholder="Nhập họ tên..."
        style={{ borderWidth: 1, borderColor: "#999", borderRadius: 8, padding: 10 }}
      />
      <Text style={{ marginTop: 12, fontSize: 16 }}>Bạn đã nhập: {hoTen}</Text>
    </View>
  );
};

export default NhapHoTen;
