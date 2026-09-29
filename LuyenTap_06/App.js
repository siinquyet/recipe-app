import { View } from "react-native";
import Greeting from "./Greeting";
import StudentInfo from "./StudentInfo";
import CounterHook from "./CounterHook";

const App = () => {
  return (
    <View>
      <Greeting name="Nguyễn Văn A" />
      <Greeting name="Trần Thị B" />
      <StudentInfo hoTen="Nguyễn Văn An" lop="CNTT-K18A" nganhHoc="Công nghệ thông tin" />
      <StudentInfo hoTen="Trần Thị Bình" lop="CNTT-K18B" nganhHoc="Khoa học máy tính" />
      <CounterHook />
    </View>
  );
};

export default App;
