import { useState } from "react";
import { Button, Text, View } from "react-native";

const CounterHook = () => {
  const [soLanBam, setSoLanBam] = useState(0);

  const tangDem = () => setSoLanBam(soLanBam + 1);

  return (
    <View>
      <Text>Số lần bấm: {soLanBam}</Text>
      <Button title="Tăng" onPress={tangDem} />
    </View>
  );
};

export default CounterHook;
