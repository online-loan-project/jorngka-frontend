<template>
  <div class="image-upload-container">
    <el-upload
      action="#"
      list-type="picture-card"
      :auto-upload="false"
      :on-change="handleChange"
      :on-remove="handleRemove"
      :file-list="fileList"
      accept="image/*"
      :class="{ 'single-upload': maxCount === 1 }"
      :limit="maxCount"
      :on-exceed="handleExceed"
    >
      <el-icon><Plus /></el-icon>

      <template #file="{ file }">
        <div class="custom-upload-item">
          <img class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
          <span class="el-upload-list__item-actions">
            <span
              class="el-upload-list__item-preview"
              @click="handlePictureCardPreview(file)"
            >
              <el-icon><ZoomIn /></el-icon>
            </span>
            <span
              class="el-upload-list__item-download"
              @click="handleDownload(file)"
            >
              <el-icon><Download /></el-icon>
            </span>
            <span
              class="el-upload-list__item-delete"
              @click="handleRemove(file)"
            >
              <el-icon><Delete /></el-icon>
            </span>
          </span>
        </div>
      </template>
    </el-upload>

    <el-dialog v-model="dialogVisible" title="Image Preview" width="75%">
      <img class="preview-image" :src="dialogImageUrl" alt="Preview Image" />
    </el-dialog>
  </div>
</template>

<script setup>
import { Delete, Download, Plus, ZoomIn } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  maxCount: {
    type: Number,
    default: 1
  },
  maxSize: {
    type: Number,
    default: 2
  },
  tipText: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const fileList = ref(props.modelValue || [])
const dialogImageUrl = ref('')
const dialogVisible = ref(false)

// Sync with v-model
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    fileList.value = [...newVal]
  }
})

const handleChange = (file, files) => {
  // Validate file size
  if (file.raw && file.raw.size / 1024 / 1024 > props.maxSize) {
    ElMessage.error(`File size cannot exceed ${props.maxSize}MB`)
    fileList.value = fileList.value.filter(f => f.uid !== file.uid)
    return false
  }

  emit('update:modelValue', files)
  return true
}

const handleRemove = (file) => {
  fileList.value = fileList.value.filter(f => f.uid !== file.uid)
  emit('update:modelValue', fileList.value)
}

const handlePictureCardPreview = (file) => {
  dialogImageUrl.value = file.url
  dialogVisible.value = true
}

const handleDownload = (file) => {
  if (file.url) {
    const link = document.createElement('a')
    link.href = file.url
    link.download = file.name || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

const handleExceed = () => {
  ElMessage.warning(`You can only upload up to ${props.maxCount} images`)
}
</script>

<style scoped>

</style>
