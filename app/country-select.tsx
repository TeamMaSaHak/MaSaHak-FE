import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { updateTimezone } from "../services/settings";

const COUNTRIES: { name: string; timezone: string }[] = [
  { name: "대한민국", timezone: "Asia/Seoul" },
  { name: "미국", timezone: "America/New_York" },
  { name: "일본", timezone: "Asia/Tokyo" },
  { name: "중국", timezone: "Asia/Shanghai" },
  { name: "영국", timezone: "Europe/London" },
  { name: "프랑스", timezone: "Europe/Paris" },
  { name: "독일", timezone: "Europe/Berlin" },
  { name: "캐나다", timezone: "America/Toronto" },
  { name: "호주", timezone: "Australia/Sydney" },
  { name: "뉴질랜드", timezone: "Pacific/Auckland" },
  { name: "싱가포르", timezone: "Asia/Singapore" },
  { name: "태국", timezone: "Asia/Bangkok" },
  { name: "베트남", timezone: "Asia/Ho_Chi_Minh" },
  { name: "인도", timezone: "Asia/Kolkata" },
  { name: "브라질", timezone: "America/Sao_Paulo" },
  { name: "멕시코", timezone: "America/Mexico_City" },
  { name: "러시아", timezone: "Europe/Moscow" },
  { name: "이탈리아", timezone: "Europe/Rome" },
  { name: "스페인", timezone: "Europe/Madrid" },
  { name: "네덜란드", timezone: "Europe/Amsterdam" },
];

function CountrySelect() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const filteredCountries = COUNTRIES.filter((c) =>
    c.name.includes(searchText)
  );

  const handleSelectCountry = (country: typeof COUNTRIES[number]) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    setSearchText("");
  };

  const handleConfirm = async () => {
    try {
      await updateTimezone(selectedCountry.timezone);
    } catch (e) {
      // Graceful degradation
    }
    navigation.reset({
      index: 0,
      routes: [{ name: "Main" }],
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 80,
          paddingBottom: Math.max(insets.bottom + 24, 40),
        },
      ]}
    >
      <View style={styles.topContent}>
        <Text style={styles.title}>
          본인이{"\n"}살고 있는 나라를{"\n"}선택하세요.
        </Text>

        <View style={styles.selectorWrapper}>
          <Pressable
            style={styles.selector}
            onPress={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <Text style={styles.selectorText}>{selectedCountry.name}</Text>
            <MaterialIcons
              name={isDropdownOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              size={24}
              color={colors.black}
            />
          </Pressable>

          {isDropdownOpen && (
            <View style={styles.dropdown}>
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="검색"
                  placeholderTextColor={colors.gray300}
                  value={searchText}
                  onChangeText={setSearchText}
                />
              </View>
              <FlatList
                data={filteredCountries}
                keyExtractor={(item) => item.name}
                style={styles.dropdownList}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.dropdownItem}
                    onPress={() => handleSelectCountry(item)}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        item.name === selectedCountry.name &&
                          styles.dropdownItemTextSelected,
                      ]}
                    >
                      {item.name}
                    </Text>
                  </Pressable>
                )}
                ItemSeparatorComponent={() => (
                  <View style={styles.separator} />
                )}
              />
            </View>
          )}
        </View>
      </View>

      <View style={styles.bottomBar}>
        <Pressable style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>확인</Text>
        </Pressable>
      </View>
    </View>
    </KeyboardAvoidingView>
  );
}

export default CountrySelect;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  topContent: {
    gap: 40,
  },
  title: {
    fontFamily: "Pretendard-Bold",
    fontSize: 36,
    lineHeight: 48,
    color: colors.black,
  },
  selectorWrapper: {
    zIndex: 10,
  },
  selector: {
    width: "100%",
    height: 50,
    backgroundColor: colors.white,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: colors.gray200,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    alignSelf: "center",
  },
  selectorText: {
    fontFamily: "Pretendard-Bold",
    fontSize: 18,
    color: colors.black,
  },
  dropdown: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gray200,
    marginTop: 8,
    alignSelf: "center",
    maxHeight: 300,
    overflow: "hidden",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInput: {
    width: "100%",
    height: 38,
    backgroundColor: colors.gray100,
    borderRadius: 19,
    paddingHorizontal: 16,
    fontFamily: "Pretendard-Regular",
    fontSize: 14,
    color: colors.black,
    alignSelf: "center",
  },
  dropdownList: {
    paddingHorizontal: 16,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  dropdownItemText: {
    fontFamily: "Pretendard-Regular",
    fontSize: 14,
    color: colors.black,
  },
  dropdownItemTextSelected: {
    fontFamily: "Pretendard-Bold",
    color: colors.black,
  },
  separator: {
    height: 1,
    backgroundColor: colors.gray100,
  },
  bottomBar: {
    alignItems: "center",
  },
  confirmButton: {
    width: 240,
    height: 50,
    backgroundColor: colors.black,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmButtonText: {
    fontFamily: "Pretendard-Bold",
    fontSize: 16,
    color: colors.white,
  },
});
