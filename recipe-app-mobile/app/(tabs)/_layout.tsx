import { Tabs } from 'expo-router';
import { CalendarDays, House, Search, ShoppingCart, User } from 'lucide-react-native';

// Bottom bar Recipely: icon active teal #70B9BE (trích từ SVG gốc)
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#70B9BE',
        tabBarInactiveTintColor: '#97A2B0',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Trang chủ', tabBarIcon: ({ color, size }) => <House color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="search"
        options={{ title: 'Tìm kiếm', tabBarIcon: ({ color, size }) => <Search color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="mealplan"
        options={{ title: 'Kế hoạch', tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="shopping"
        options={{ title: 'Đi chợ', tabBarIcon: ({ color, size }) => <ShoppingCart color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Hồ sơ', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
      />
    </Tabs>
  );
}
