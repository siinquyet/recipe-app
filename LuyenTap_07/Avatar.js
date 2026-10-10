import { Image } from "react-native";

const Avatar = ({ profileImage }) => {
  return (
    <Image
      source={{ uri: profileImage }}
      style={{ width: 64, height: 64, borderRadius: 32 }}
    />
  );
};

export default Avatar;
