
let questionCount = 0;// 質問数をカウントする変数
let incorrectQuestions = [];
let selectedAnswer = '';  // ユーザーの選択を記録
let correctAnswersCount = 0;// 正解した数をカウントする変数

// -----------------------------------------------------
// 外部JSONファイルを非同期で取得
function loadNextQuestion() {
  fetch("questions.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("HTTPエラー: " + response.status);
      }
      return response.json();
    })
    .then((jsonData) => {
      if (Array.isArray(jsonData)) {
        const randomIndex = Math.floor(Math.random() * jsonData.length);
        const question = jsonData[randomIndex];
        displayQuestion(question);
      } else {
        console.error("jsonData は配列ではありません");
      }
    })
    .catch((error) => {
      console.error("次の質問の読み込みに失敗しました:", error);
    });
}

// -----------------------------------------------------
// 質問を表示する処理
function displayQuestion(question) {
  questionCount++; // 質問数をカウント

  const contentDiv = document.getElementById("content");
  contentDiv.innerHTML = `
    <h5>${question.class1}　　${question.class2}</h5>
    <h5>問題番号: ${question.no}</h5>
    <h2>第: ${questionCount}問目　　正答数：${correctAnswersCount}/${questionCount}</h2>
    <br>
    <p>${question.text}</p>
    <br>
    <ul id="options"></ul>
    <button id="submitButton" class="option-button" disabled>回答する</button>
  `;

  const optionsDiv = document.getElementById("options");
  const optionLabels = ["A", "B", "C", "D"];

  // 選択肢をシャッフルし、新しい正解のラベルを再設定
  const { shuffledOptions, newAnswerLabel } = shuffleOptionsAndSetAnswer(
    question.options,
    question.answer
  );

  // ランダムに並び替えた選択肢にラベルを付与して表示
  shuffledOptions.forEach((text, index) => {
    const label = optionLabels[index]; // ラベルを再割り当て
    const button = document.createElement("button");
    button.textContent = `${label}`;
    button.classList.add("option-button");
    button.onclick = () => handleOptionClick(label, text, newAnswerLabel);

    const li = document.createElement("li");
    li.textContent = `${label}. ${text}`;
    optionsDiv.appendChild(li);
    optionsDiv.appendChild(button);
  });

  // 回答ボタンのクリックイベント
  document.getElementById("submitButton").onclick = () =>
    handleSubmit(question, newAnswerLabel);
}

// -----------------------------------------------------
// 選択肢をシャッフルし、新しい正解のラベルを設定する関数
function shuffleOptionsAndSetAnswer(options, currentAnswerLabel) {
  const optionLabels = ["A", "B", "C", "D"];
  const correctOption = options[optionLabels.indexOf(currentAnswerLabel)]; // 現在の正答を取得

  // 選択肢をシャッフル
  const shuffledOptions = shuffleArray([...options]);

  // 新しい正答のラベルを取得
  const newAnswerIndex = shuffledOptions.indexOf(correctOption);
  const newAnswerLabel = optionLabels[newAnswerIndex];

  return { shuffledOptions, newAnswerLabel };
}

// -----------------------------------------------------
// 配列をランダムにシャッフルする関数
function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

// -----------------------------------------------------
// 選択肢ボタンがクリックされたときの処理
function handleOptionClick(label, option, correctAnswer) {
  selectedAnswer = label; // ユーザーの選択を記録
  const submitButton = document.getElementById("submitButton");
  submitButton.disabled = false; // 回答ボタンを有効化

  // 全ての選択肢ボタンのスタイルをリセット
  const buttons = document.querySelectorAll(".option-button");
  buttons.forEach((button) => {
    button.style.backgroundColor = ""; // 背景色をリセット
    button.style.color = ""; // テキスト色をリセット
    button.style.border = ""; // ボーダーをリセット
  });

  // 選択したボタンのスタイルを変更
  const selectedButton = Array.from(buttons).find(
    (button) => button.textContent === label
  );
  if (selectedButton) {
    selectedButton.style.backgroundColor = "lightblue"; // 背景色を設定
    selectedButton.style.color = "white"; // テキスト色を変更
    selectedButton.style.border = "2px solid blue"; // ボーダーを強調
  }

  console.log(`選択: ${label} - ${option}`);//デバッグ
}

// -----------------------------------------------------
// 回答が送信されたときの処理
function handleSubmit(question, selectedAnswer) {
  const resultModal = document.getElementById("resultModal");
  const resultMessage = document.getElementById("resultMessage");

  console.log(`選択: ${selectedAnswer}`); // デバッグ
  console.log(`正解: ${question.answer}`); // デバッグ

  const message =
    selectedAnswer === question.answer
      ? `正解です！選択したのは "${selectedAnswer}"`
      : `不正解です。正しい答えは "${question.answer}" でした。`;

  resultMessage.textContent = message;
  resultModal.style.display = "block";

  // 正解した場合はカウントを増やす
  if (selectedAnswer === question.answer) {
    correctAnswersCount++;
  }

  // 間違えた問題を記録
  if (selectedAnswer !== question.answer) {
    incorrectQuestions.push(question);
  }

  // 次の質問に進む
  document.getElementById("nextQuestionButton").onclick = () => {
    resultModal.style.display = "none";
    loadNextQuestion();
  };
}

// -----------------------------------------------------
// 間違えた問題一覧ページを表示
function showIncorrectQuestions() {
  const incorrectQuestionsList = document.getElementById("incorrectQuestionsList");
  incorrectQuestionsList.innerHTML = ""; // リストをクリア

  incorrectQuestions.forEach((question) => {
    const li = document.createElement("li");
    li.textContent = `${question.no} ：${question.text} (選択した答え: ${question.answer})`;
    incorrectQuestionsList.appendChild(li);
  });

  // 現在のページを非表示にして、間違えた問題一覧ページを表示
  document.getElementById("content").style.display = "none";
  document.getElementById("incorrectQuestionsPage").style.display = "block";
}

// -----------------------------------------------------
// 戻るボタンの処理
function goBack() {
  // 現在のページを非表示にして、元のページを表示
  document.getElementById("incorrectQuestionsPage").style.display = "none";
  document.getElementById("content").style.display = "block";
}

// モーダルを閉じる処理
document.getElementById("closeModal").onclick = () => {
  document.getElementById("resultModal").style.display = "none";
};

// 初期状態で質問を表示
loadNextQuestion();