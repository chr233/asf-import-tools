<!--
 * @Author       : Chr_
 * @Date         : 2026-01-08 10:59:41
 * @LastEditors  : Chr_
 * @LastEditTime : 2026-01-08 10:59:59
 * @Description  : 
-->
<script setup>
import { ref } from "vue";

const accountText = ref("");
const accountCount = ref(0);
const isDragOver = ref(false);
const folderFiles = ref([]);

//导入结果
const importResult = ref([]);

const separatorRegex = /[,， \t]|----/;

/**
 * 读取账号文件
 * @param file
 */
function readAccountFromFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    accountText.value = e.target.result;
  };
  reader.onerror = () => {
    alert("文件读取失败");
  };
  reader.readAsText(file);
}

/**
 * 拖拽账号文件导入
 */
function onAccountFileDrop(event) {
  isDragOver.value = false;
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    readAccountFromFile(files[0]);
  }
}

/**
 * 选择账号文件导入
 * @param event
 */
function onSelectAccounts(event) {
  const files = event.target.files;
  if (files.length > 0) {
    readAccountFromFile(files[0]);
  }
}

/**
 * 选择令牌文件夹
 */
async function onSelectMaFiles(event) {
  const files = Array.from(event.target.files);

  if (files.length > 0) {
    // 保存文件列表
    folderFiles.value = files;
  } else {
    folderFiles.value = [];
  }
}

/**
 * 更新账号数量
 */
function updateAccountCount() {
  if (!accountText.value) {
    accountCount.value = 0;
    return;
  }

  let count = 0;
  const lines = accountText.value.split("\n");

  for (const line of lines) {
    if (!line.trim()) {
      continue;
    }

    const parts = line.split(separatorRegex).filter((x) => x);
    if (parts.length >= 2) {
      count++;
    }
  }

  accountCount.value = count;
}

/**
 * 解析账号信息
 * @param text
 */
function parseAccounts() {
  const lines = accountText.value.split("\n");
  const result = [];

  for (const line of lines) {
    if (!line.trim()) {
      continue;
    }

    const parts = line.split(separatorRegex).filter((x) => x);

    if (parts.length >= 2) {
      const username = parts[0].trim();
      const password = parts[1].trim();

      result.push({
        username,
        password,
        identitySecret: null,
        sharedSecret: null,
      });
    }
  }

  return result;
}

/**
 * 读取令牌文件
 * @param file
 */
function readJsonFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        resolve(json);
      } catch {
        resolve(null);
      }
    };
    reader.onerror = () => {
      resolve(null);
    };
    reader.readAsText(file);
  });
}

/**
 * 执行导入操作
 */
async function doImport() {
  importResult.value = [];

  if (folderFiles.value.length === 0) {
    alert("请先选择文件夹");
    return;
  }

  if (!accountText.value.trim()) {
    alert("请先输入账号信息");
    return;
  }

  // 解析账号信息
  const parsedAccounts = parseAccounts(accountText.value);

  // 创建文件名到文件的映射
  const fileMap = {};
  for (const file of folderFiles.value) {
    const fileName = file.name.toString().toLowerCase();
    fileMap[fileName] = file;
  }

  // 为每个账号查找对应的 JSON 文件
  for (const account of parsedAccounts) {
    const fileName = account.username + ".mafile";
    const jsonFile = fileMap[fileName];
    if (!jsonFile) {
      continue;
    }

    const jsonData = await readJsonFile(jsonFile);
    if (jsonData) {
      const { identity_secret, shared_secret } = jsonData;
      account.identitySecret = identity_secret ?? null;
      account.sharedSecret = shared_secret ?? null;
    }
  }

  importResult.value = parsedAccounts;
}
</script>

<template>
  <div class="app">
    <!-- 账号信息输入区域 -->
    <div class="section">
      <h2>账号信息</h2>
      <textarea
        v-model="accountText"
        @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false"
        @drop.prevent="onAccountFileDrop"
        @input="updateAccountCount"
        :class="{ 'drag-over': isDragOver }"
        placeholder="每行一个账号，用 ---- 或者, 分隔账号名和密码&#10;例如：username----password"
      ></textarea>

      <p>
        共 {{ accountCount }} 个机器人账号, 支持拖拽文件到文本框中自动读取内容
      </p>
      <div class="input-group">
        <input type="file" @change="onSelectAccounts" accept="*/txt" />
      </div>
    </div>

    <!-- 文件夹选择区域 -->
    <div class="section">
      <h2>令牌信息</h2>
      <div class="input-group">
        <input
          type="file"
          webkitdirectory
          directory
          multiple
          @change="onSelectMaFiles"
        />
      </div>
    </div>

    <div class="section">
      <button @click="doImport">执行导入</button>
    </div>

    <!-- 数据表格 -->
    <div class="section">
      <h2>导入结果</h2>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>账号</th>
              <th>密码</th>
              <th>IdentitySecret</th>
              <th>SharedSecret</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="importResult.length === 0">
              <td colspan="4" class="no-data">
                暂无数据，请先输入账号信息并选择文件夹
              </td>
            </tr>

            <tr v-for="(account, index) in importResult" :key="index">
              <td :class="{ 'null-value': account.username === null }">
                {{ account.username ?? "null" }}
              </td>
              <td :class="{ 'null-value': account.password === null }">
                {{ account.password ?? "null" }}
              </td>
              <td :class="{ 'null-value': account.secret1 === null }">
                {{ account.identitySecret ?? "null" }}
              </td>
              <td :class="{ 'null-value': account.secret2 === null }">
                {{ account.sharedSecret ?? "null" }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
h2 {
  margin: 10px 0;
}

.section {
  margin: 10px;
}

textarea {
  width: 100%;
  height: 200px;
  padding: 10px;
  border-radius: 5px;
  resize: vertical;
  font-family: monospace;
  transition: border-color 0.3s, background-color 0.3s;
}

textarea:focus {
  outline: none;
  border-color: #007bff;
}

textarea.drag-over {
  border-color: #28a745;
  background-color: #f0fff0;
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #0056b3;
}

.table-wrapper {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  border: 1px solid #ddd;
  padding: 10px 12px;
  text-align: left;
}

.data-table th {
  background-color: #007bff;
  color: white;
  font-weight: 600;
  position: sticky;
  top: 0;
}

.data-table tr:nth-child(even) {
  background-color: #f8f9fa;
}

.data-table tbody tr:hover {
  background-color: #e9ecef;
}

.data-table td.null-value {
  color: #999;
  font-style: italic;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #888;
}
</style>
