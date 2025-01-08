// 外部JSONファイルを非同期で取得
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

      if (question.options && Array.isArray(question.options)) {
        displayQuestion(question);
      } else {
        console.error("options プロパティが無効または配列ではありません");
      }
    } else {
      console.error("jsonData は配列ではありません");
    }
  })
  .catch((error) => {
    console.error("JSONの読み込みに失敗しました:", error);
    document.getElementById("content").innerHTML =
      "JSONの読み込みに失敗しました。";
  });

// -----------------------------------------------------
// 質問数をカウントする変数
let questionCount = 0;

// 質問を表示する処理
function displayQuestion(question) {
  questionCount++; // 質問数をカウント

  const contentDiv = document.getElementById("content");
  contentDiv.innerHTML = `
    <h5>${question.class1}</h5>
    <h5>${question.class2}</h5>
    <h5>問題番号: ${question.no}</h5>
    <h2>第: ${questionCount}問目</h2>
    <br>
    <p>${question.text}</p>
    <br>
    <ul id="options"></ul>
    <button id="submitButton" class="option-button" disabled>回答する</button>

  `;

  const optionsDiv = document.getElementById("options");
  const optionLabels = ["A", "B", "C", "D"];

  // 選択肢をシャッフルし、正解のラベルを再設定
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
    handleSubmit({ ...question, answer: newAnswerLabel });
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

  console.log(`選択: ${label} - ${option}`);
}

// -----------------------------------------------------
// 回答ボタンがクリックされたときの処理
function handleSubmit(question) {
  const resultModal = document.getElementById("resultModal");
  const resultMessage = document.getElementById("resultMessage");

  const message =
    selectedAnswer === question.answer
      ? `正解です！選択したのは "${selectedAnswer}"`
      : `不正解です。正しい答えは "${question.answer}" でした。`;

  resultMessage.textContent = message;

  // モーダルを表示
  resultModal.style.display = "block";

  // モーダルを閉じるイベント
  document.getElementById("closeModal").onclick = () => {
    resultModal.style.display = "none";
  };

  // モーダル外をクリックで閉じる
  window.onclick = (event) => {
    if (event.target === resultModal) {
      resultModal.style.display = "none";
    }
  };
}

// -----------------------------------------------------
// モーダル内の「次の質問」ボタンをセットアップ
function setupNextQuestionButton() {
  const nextQuestionButton = document.getElementById("nextQuestionButton");
  nextQuestionButton.onclick = () => {
    // モーダルを非表示にする
    const resultModal = document.getElementById("resultModal");
    resultModal.style.display = "none";

    // 次の質問をロード
    loadNextQuestion();
  };
}

// -----------------------------------------------------
// 次の質問をロードする処理
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

// モーダル内の「次の質問」ボタンをセットアップ
setupNextQuestionButton();
