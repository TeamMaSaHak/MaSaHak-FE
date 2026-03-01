import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  TextInput,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../constants/colors";

const COUNTRIES = [
  "대한민국",
  "미국",
  "일본",
  "중국",
  "영국",
  "프랑스",
  "독일",
  "캐나다",
  "호주",
  "뉴질랜드",
  "싱가포르",
  "태국",
  "베트남",
  "인도",
  "브라질",
  "멕시코",
  "러시아",
  "이탈리아",
  "스페인",
  "네덜란드",
];

function CountrySelect() {
  const navigation = useNavigation<any>();
  const [selectedCountry, setSelectedCountry] = useState("대한민국");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const filteredCountries = COUNTRIES.filter((country) =>
    country.includes(searchText)
  );

  const handleSelectCountry = (country: string) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    setSearchText("");
  };

  const handleConfirm = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "Main" }],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topContent}>
        <Text style={styles.title}>
          본인이{"\n"}살고 있는 나라를{"\n"}선택하세요.
        </Text>

        <View style={styles.selectorWrapper}>
          <Pressable
            style={styles.selector}
            onPress={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <Text style={styles.selectorText}>{selectedCountry}</Text>
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
                keyExtractor={(item) => item}
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
                        item === selectedCountry &&
                          styles.dropdownItemTextSelected,
                      ]}
                    >
                      {item}
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
  );
}

export default CountrySelect;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    paddingTop: 150,
    paddingBottom: 100,
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
    width: 342,
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
    width: 342,
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
    width: 310,
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
