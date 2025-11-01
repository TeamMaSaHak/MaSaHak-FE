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
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { Topbar } from "../components/topbar";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

function Todolist() {
  const [categories, setCategories] = useState<Category[]>([
    { id: "1", name: "개인", color: "#FF6B6B" },
    { id: "2", name: "업무", color: "#4ECDC4" },
    { id: "3", name: "공부", color: "#95E1D3" },
  ]);

  const [todos, setTodos] = useState<Todo[]>([
    { id: "1", text: "아침 운동하기", completed: false, categoryId: "1" },
    { id: "2", text: "회의 준비", completed: false, categoryId: "2" },
    { id: "3", text: "React Native 공부", completed: true, categoryId: "3" },
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>("1");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showTodoModal, setShowTodoModal] = useState(false);
  const [showKebabMenu, setShowKebabMenu] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newTodoText, setNewTodoText] = useState("");
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  // 오늘 해야할 일 개수 (완료되지 않은 것만)
  const todayTodoCount = todos.filter((todo) => !todo.completed).length;

  // 선택된 카테고리의 투두 가져오기
  const getCategoryTodos = (categoryId: string) => {
    const categoryTodos = todos.filter((todo) => todo.categoryId === categoryId);
    // 완료되지 않은 것을 위로, 완료된 것을 아래로 정렬
    return categoryTodos.sort((a, b) => {
      if (a.completed === b.completed) return 0;
      return a.completed ? 1 : -1;
    });
  };

  // 투두 체크/언체크
  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // 투두 삭제
  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
    setShowKebabMenu(null);
  };

  // 투두 수정
  const editTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setNewTodoText(todo.text);
    setShowTodoModal(true);
    setShowKebabMenu(null);
  };

  // 투두 저장
  const saveTodo = () => {
    if (!newTodoText.trim()) return;

    if (editingTodo) {
      // 수정
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === editingTodo.id ? { ...todo, text: newTodoText } : todo
        )
      );
    } else {
      // 새로 추가
      const newTodo: Todo = {
        id: Date.now().toString(),
        text: newTodoText,
        completed: false,
        categoryId: selectedCategory,
      };
      setTodos((prev) => [...prev, newTodo]);
    }

    setNewTodoText("");
    setEditingTodo(null);
    setShowTodoModal(false);
  };

  // 카테고리 추가
  const addCategory = () => {
    if (!newCategoryName.trim()) return;

    const colors = ["#FF6B6B", "#4ECDC4", "#95E1D3", "#F38181", "#AA96DA"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newCategory: Category = {
      id: Date.now().toString(),
      name: newCategoryName,
      color: randomColor,
    };

    setCategories((prev) => [...prev, newCategory]);
    setNewCategoryName("");
    setShowCategoryModal(false);
  };

  return (
    <View style={styles.container}>
      <Topbar title="투두리스트" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 오늘 할 일 개수 */}
        <View style={styles.todaySection}>
          <Text style={styles.todayText}>오늘 할 일</Text>
          <Text style={styles.todayCount}>{todayTodoCount}개</Text>
        </View>

        {/* 카테고리 목록 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          {categories.map((category) => (
            <Pressable
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive,
                { borderColor: category.color },
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && {
                    color: category.color,
                    fontWeight: "600",
                  },
                ]}
              >
                {category.name}
              </Text>
            </Pressable>
          ))}

          {/* 카테고리 추가 버튼 */}
          <Pressable
            style={styles.categoryAddButton}
            onPress={() => setShowCategoryModal(true)}
          >
            <Ionicons name="add" size={20} color={colors.black} />
          </Pressable>
        </ScrollView>

        {/* 투두 리스트 */}
        <View style={styles.todoList}>
          {getCategoryTodos(selectedCategory).map((todo) => (
            <View key={todo.id} style={styles.todoItem}>
              {/* 체크박스 */}
              <Pressable
                style={styles.checkbox}
                onPress={() => toggleTodo(todo.id)}
              >
                <Ionicons
                  name={
                    todo.completed ? "checkmark-circle" : "ellipse-outline"
                  }
                  size={24}
                  color={
                    todo.completed
                      ? categories.find((c) => c.id === selectedCategory)
                          ?.color
                      : colors.black
                  }
                />
              </Pressable>

              {/* 투두 텍스트 */}
              <Text
                style={[
                  styles.todoText,
                  todo.completed && styles.todoTextCompleted,
                ]}
              >
                {todo.text}
              </Text>

              {/* 케밥 메뉴 */}
              <Pressable
                style={styles.kebabButton}
                onPress={() =>
                  setShowKebabMenu(showKebabMenu === todo.id ? null : todo.id)
                }
              >
                <Ionicons
                  name="ellipsis-vertical"
                  size={20}
                  color={colors.black}
                />
              </Pressable>

              {/* 케밥 메뉴 드롭다운 */}
              {showKebabMenu === todo.id && (
                <View style={styles.kebabMenu}>
                  <Pressable
                    style={styles.kebabMenuItem}
                    onPress={() => editTodo(todo)}
                  >
                    <Text style={styles.kebabMenuText}>수정</Text>
                  </Pressable>
                  <Pressable
                    style={styles.kebabMenuItem}
                    onPress={() => deleteTodo(todo.id)}
                  >
                    <Text style={[styles.kebabMenuText, styles.deleteText]}>
                      삭제
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 새 투두 추가 Floating Button */}
      <Pressable
        style={styles.floatingButton}
        onPress={() => {
          setEditingTodo(null);
          setNewTodoText("");
          setShowTodoModal(true);
        }}
      >
        <Ionicons name="add" size={32} color={colors.white} />
      </Pressable>

      {/* 카테고리 추가 모달 */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowCategoryModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>새 카테고리</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="카테고리 이름"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowCategoryModal(false);
                  setNewCategoryName("");
                }}
              >
                <Text style={styles.modalButtonText}>취소</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={addCategory}
              >
                <Text
                  style={[styles.modalButtonText, styles.modalButtonTextWhite]}
                >
                  추가
                </Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* 투두 추가/수정 모달 */}
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
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingTodo ? "투두 수정" : "새 투두"}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="할 일을 입력하세요"
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
                <Text style={styles.modalButtonText}>취소</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={saveTodo}
              >
                <Text
                  style={[styles.modalButtonText, styles.modalButtonTextWhite]}
                >
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
    padding: 24,
    paddingTop: 74,
  },
  todaySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  todayText: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.black,
  },
  todayCount: {
    fontSize: 24,
    fontWeight: "600",
    color: "#4ECDC4",
  },
  categoryScroll: {
    marginBottom: 24,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    marginRight: 8,
    backgroundColor: colors.white,
  },
  categoryChipActive: {
    backgroundColor: "#F5F5F5",
  },
  categoryText: {
    fontSize: 14,
    color: colors.black,
  },
  categoryAddButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  todoList: {
    gap: 12,
  },
  todoItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    position: "relative",
  },
  checkbox: {
    marginRight: 12,
  },
  todoText: {
    flex: 1,
    fontSize: 16,
    color: colors.black,
  },
  todoTextCompleted: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  kebabButton: {
    padding: 4,
  },
  kebabMenu: {
    position: "absolute",
    right: 40,
    top: 12,
    backgroundColor: colors.white,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 80,
    zIndex: 10,
  },
  kebabMenuItem: {
    padding: 12,
  },
  kebabMenuText: {
    fontSize: 14,
    color: colors.black,
  },
  deleteText: {
    color: "#FF6B6B",
  },
  floatingButton: {
    position: "absolute",
    right: 24,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.black,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: "80%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    color: colors.black,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonCancel: {
    backgroundColor: "#F5F5F5",
  },
  modalButtonConfirm: {
    backgroundColor: colors.black,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.black,
  },
  modalButtonTextWhite: {
    color: colors.white,
  },
});
