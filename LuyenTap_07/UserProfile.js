import { Text, View } from "react-native";
import Avatar from "./Avatar";

const UserProfile = ({ name, bio, profileImage }) => {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", padding: 16, gap: 12 }}>
      <Avatar profileImage={profileImage} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>{name}</Text>
        <Text style={{ color: "#555" }}>{bio}</Text>
      </View>
    </View>
  );
};

export default UserProfile;
