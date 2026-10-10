import { ScrollView } from "react-native";
import NhapHoTen from "./NhapHoTen";
import UserProfile from "./UserProfile";
import FormDangKy from "./FormDangKy";

const App = () => {
  return (
    <ScrollView>
      <NhapHoTen />
      <UserProfile
        name="Minh Anh"
        bio="Thích nấu món Việt, cuối tuần hay làm bánh."
        profileImage="https://picsum.photos/seed/minhanh/200"
      />
      <UserProfile
        name="Đức Đầu Bếp"
        bio="Chuyên món nướng, 5 năm đứng bếp."
        profileImage="https://picsum.photos/seed/ducdaubep/200"
      />
      <FormDangKy />
    </ScrollView>
  );
};

export default App;
