<template>
  <n-tabs class="all-box" size="large" justify-content="space-evenly" animated>
    <n-tab-pane class="no-padding height--full" name="link" tab="捷径">
      <ShortCut />
    </n-tab-pane>
    <n-tab-pane name="note" tab="便签">
      <Note />
    </n-tab-pane>
    <n-tab-pane name="more" tab="待办">
      <Todo />
    </n-tab-pane>
  </n-tabs>
</template>

<script setup>
import { NTabs, NTabPane } from "naive-ui";
import ShortCut from "@/components/AllFunc/Box/ShortCut.vue";
import Note from "@/components/AllFunc/Box/Note.vue";
import Todo from "@/components/AllFunc/Box/Todo.vue";
</script>


<style>
.height--full {
  height: 100%;
  overflow: hidden;
}

</style>
