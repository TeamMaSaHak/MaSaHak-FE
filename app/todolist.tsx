import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Modal,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { Topbar } from "../components/topbar";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

type TabType = "전체" | "반복";

function Todolist() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: "1", text: "아침 운동하기", completed: false },
    { id: "2", text: "회의 준비", completed: false },
    { id: "3", text: "React Native 공부", completed: true },
    { id: "4", text: "장보기", completed: false },
    { id: "5", text: "독서 30분", completed: false },
  ]);

  const [selectedTab, setSelectedTab] = useState<TabType>("전체");
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [showTodoModal, setShowTodoModal] = useState(false);
  const [newTodoText, setNewTodoText] = useState("");
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [currentDate, setCurrentDate] = useState("2025.08.03");

  const totalCount = todos.length;
  const repeatCount = 0;

  const getSortedTodos = () => {
    return [...todos].sort((a, b) => {
      if (a.completed === b.completed) return 0;
      return a.completed ? 1 : -1;
    });
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
    setShowMenu(null);
  };

  const editTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setNewTodoText(todo.text);
    setShowTodoModal(true);
    setShowMenu(null);
  };

  const saveTodo = () => {
    if (!newTodoText.trim()) return;

    if (editingTodo) {
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === editingTodo.id ? { ...todo, text: newTodoText } : todo
        )
      );
    } else {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text: newTodoText,
        completed: false,
      };
      setTodos((prev) => [...prev, newTodo]);
    }

    setNewTodoText("");
    setEditingTodo(null);
    setShowTodoModal(false);
  };

  const navigateDate = (direction: "back" | "forward") => {
    // Date navigation placeholder
  };

  return (
    <View style={styles.container}>
      <Topbar title="투두리스트" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date navigation row */}
        <View style={styles.dateRow}>
          <Pressable onPress={() => navigateDate("back")}>
            <MaterialIcons
              name="chevron-left"
              size={14}
              color={colors.black}
            />
          </Pressable>
          <Text style={styles.dateText}>{currentDate}</Text>
          <Pressable onPress={() => navigateDate("forward")}>
            <MaterialIcons
              name="chevron-right"
              size={14}
              color={colors.black}
            />
          </Pressable>
        </View>

        {/* Hero section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            {"오늘 해야하는 일\n"}
            <Text style={styles.heroTitle}>{totalCount}개</Text>
          </Text>
          <Text style={styles.heroQuote}>
            한 줄 어쩌고 낭만 감성 오늘의 글귀...
          </Text>
        </View>

        {/* Tab chips row */}
        <View style={styles.tabRow}>
          <Pressable
            style={[
              styles.tabChip,
              selectedTab === "전체" && styles.tabChipActive,
            ]}
            onPress={() => setSelectedTab("전체")}
          >
            <Text
              style={[
                styles.tabChipText,
                selectedTab === "전체" && styles.tabChipTextActive,
              ]}
            >
              전체
            </Text>
            <View
              style={[
                styles.tabBadge,
                selectedTab === "전체"
                  ? styles.tabBadgeActive
                  : styles.tabBadgeInactive,
              ]}
            >
              <Text
                style={[
                  styles.tabBadgeText,
                  selectedTab === "전체"
                    ? styles.tabBadgeTextActive
                    : styles.tabBadgeTextInactive,
                ]}
              >
                {totalCount}
              </Text>
            </View>
          </Pressable>

          <Pressable
            style={[
              styles.tabChip,
              selectedTab === "반복"
                ? styles.tabChipActive
                : styles.tabChipInactive,
            ]}
            onPress={() => setSelectedTab("반복")}
          >
            <Text
              style={[
                styles.tabChipText,
                selectedTab === "반복"
                  ? styles.tabChipTextActive
                  : styles.tabChipTextInactive,
              ]}
            >
              반복
            </Text>
            <View
              style={[
                styles.tabBadge,
                selectedTab === "반복"
                  ? styles.tabBadgeActive
                  : styles.tabBadgeInactive,
              ]}
            >
              <Text
                style={[
                  styles.tabBadgeText,
                  selectedTab === "반복"
                    ? styles.tabBadgeTextActive
                    : styles.tabBadgeTextInactive,
                ]}
              >
                {repeatCount}
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Todo items list */}
        <View style={styles.todoList}>
          {getSortedTodos().map((todo, index) => (
            <View key={todo.id}>
              <View style={styles.todoItem}>
                <Pressable
                  style={styles.checkbox}
                  onPress={() => toggleTodo(todo.id)}
                >
                  <MaterialIcons
                    name={
                      todo.completed
                        ? "radio-button-checked"
                        : "radio-button-unchecked"
                    }
                    size={16}
                    color={colors.black}
                  />
                </Pressable>

                <Text
                  style={[
                    styles.todoText,
                    todo.completed && styles.todoTextCompleted,
                  ]}
                >
                  {todo.text}
                </Text>

                <Pressable
                  style={styles.moreButton}
                  onPress={() =>
                    setShowMenu(showMenu === todo.id ? null : todo.id)
                  }
                >
                  <MaterialIcons
                    name="more-horiz"
                    size={24}
                    color={colors.black}
                  />
                </Pressable>

                {/* Menu popup */}
                {showMenu === todo.id && (
                  <View style={styles.menuPopup}>
                    <Pressable
                      style={styles.menuItem}
                      onPress={() => editTodo(todo)}
                    >
                      <Text style={styles.menuItemText}>수정</Text>
                    </Pressable>
                    <View style={styles.menuDivider} />
                    <Pressable
                      style={styles.menuItem}
                      onPress={() => deleteTodo(todo.id)}
                    >
                      <Text style={styles.menuItemText}>삭제</Text>
                    </Pressable>
                  </View>
                )}
              </View>

              {/* Separator line */}
              {index < getSortedTodos().length - 1 && (
                <View style={styles.separator} />
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Floating add button */}
      <Pressable
        style={styles.floatingButton}
        onPress={() => {
          setEditingTodo(null);
          setNewTodoText("");
          setShowTodoModal(true);
        }}
      >
        <MaterialIcons name="add" size={52} color={colors.white} />
      </Pressable>

      {/* Add/Edit modal */}
      <Modal
        visible={showTodoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTodoModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            setShowTodoModal(false);
            setNewTodoText("");
            setEditingTodo(null);
          }}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <Text style={styles.modalTitle}>
              {editingTodo ? "투두 수정" : "투두 추가"}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="할 일을 입력하세요"
              placeholderTextColor={colors.gray300}
              value={newTodoText}
              onChangeText={setNewTodoText}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowTodoModal(false);
                  setNewTodoText("");
                  setEditingTodo(null);
                }}
              >
                <Text style={styles.modalButtonCancelText}>취소</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={saveTodo}
              >
                <Text style={styles.modalButtonConfirmText}>
                  {editingTodo ? "수정" : "추가"}
                </Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

export default Todolist;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    position: "relative",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 74,
  },

  /* Date navigation row */
  dateRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
  },
  dateText: {
    fontFamily: "Pretendard-Bold",
    fontSize: 18,
    lineHeight: 24,
    color: colors.black,
  },

  /* Hero section */
  heroSection: {
    marginBottom: 24,
  },
  heroTitle: {
    fontFamily: "Pretendard-Bold",
    fontSize: 36,
    lineHeight: 48,
    color: colors.black,
  },
  heroQuote: {
    fontFamily: "Pretendard-Regular",
    fontSize: 14,
    lineHeight: 20,
    color: colors.gray300,
    marginTop: 8,
  },

  /* Tab chips row */
  tabRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  tabChip: {
    flexDirection: "row",
    alignItems: "center",
    height: 28,
    paddingHorizontal: 12,
    borderRadius: 27,
    gap: 6,
  },
  tabChipActive: {
    backgroundColor: colors.black,
  },
  tabChipInactive: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.black,
  },
  tabChipText: {
    fontFamily: "Pretendard-Bold",
    fontSize: 12,
  },
  tabChipTextActive: {
    color: colors.white,
  },
  tabChipTextInactive: {
    color: colors.black,
  },
  tabBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  tabBadgeActive: {
    backgroundColor: colors.gray400,
  },
  tabBadgeInactive: {
    backgroundColor: colors.gray100,
  },
  tabBadgeText: {
    fontFamily: "Pretendard-Bold",
    fontSize: 12,
  },
  tabBadgeTextActive: {
    color: colors.white,
  },
  tabBadgeTextInactive: {
    color: colors.black,
  },

  /* Todo items list */
  todoList: {},
  todoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    position: "relative",
  },
  checkbox: {
    marginRight: 12,
  },
  todoText: {
    flex: 1,
    fontFamily: "Pretendard-Regular",
    fontSize: 14,
    lineHeight: 20,
    color: colors.black,
  },
  todoTextCompleted: {
    textDecorationLine: "line-through",
    color: colors.gray300,
  },
  moreButton: {
    padding: 4,
  },
  separator: {
    width: 342,
    height: 1,
    backgroundColor: colors.gray200,
    alignSelf: "center",
  },

  /* Menu popup */
  menuPopup: {
    position: "absolute",
    right: 28,
    top: 8,
    width: 120,
    height: 35,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
  },
  menuItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 35,
  },
  menuItemText: {
    fontFamily: "Pretendard-Regular",
    fontSize: 14,
    color: colors.black,
  },
  menuDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.gray200,
  },

  /* Floating add button */
  floatingButton: {
    position: "absolute",
    right: 24,
    bottom: 100,
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.black,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: 244,
  },
  modalTitle: {
    fontFamily: "Pretendard-Bold",
    fontSize: 18,
    lineHeight: 24,
    color: colors.black,
    marginBottom: 16,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 8,
    padding: 12,
    fontFamily: "Pretendard-Regular",
    fontSize: 14,
    color: colors.black,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonCancel: {
    backgroundColor: colors.gray100,
  },
  modalButtonConfirm: {
    backgroundColor: colors.black,
  },
  modalButtonCancelText: {
    fontFamily: "Pretendard-Bold",
    fontSize: 14,
    color: colors.black,
  },
  modalButtonConfirmText: {
    fontFamily: "Pretendard-Bold",
    fontSize: 14,
    color: colors.white,
  },
});
