import { createStaticNavigation } from "@react-navigation/stack";
import Login from "./app/login";
import Signup from "./app/signup";
import { BottomTab } from "./components/bottom-tab";
function Router() {
  const Stack = createStackNativator();
  return (
    <Stack.Nativator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" component={Login} />1
      <Stack.Screen name="signup" component={Signup} />
      <Stack.Screen name="bottomtab" component={BottomTab} />
    </Stack.Nativator>
  );
}
