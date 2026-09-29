import { Text, View } from "react-native";

const StudentInfo = ({ hoTen, lop, nganhHoc }) => {
  return (
    <View>
      <Text>Họ tên: {hoTen}</Text>
      <Text>Lớp: {lop}</Text>
      <Text>Ngành học: {nganhHoc}</Text>
    </View>
  );
};

export default StudentInfo;
