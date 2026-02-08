<template>
  <div class="pref-image">
    <h4>{{ $t('Image') }}</h4>
    <section class="image-ctrl">
      <div>{{ $t('Default action after an image is inserted from local folder or clipboard') }}
        <el-tooltip class='item' effect='dark'
          :content="$t('Clipboard handling is only fully supported on macOS and Windows.')"
          placement='top-start'>
          <i class="el-icon-info"></i>
        </el-tooltip>
      </div>
      <CurSelect :value="imageInsertAction" :options="imageActions"
        :onChange="value => onSelectChange('imageInsertAction', value)"></CurSelect>
    </section>
    <Separator />
    <FolderSetting v-if="imageInsertAction === 'folder' || imageInsertAction === 'path'" />
    <Uploader v-if="imageInsertAction === 'upload'" />
  </div>
</template>

<script>
import Separator from '../common/separator'
import Uploader from './components/uploader'
import CurSelect from '@/prefComponents/common/select'
import FolderSetting from './components/folderSetting'
import { getImageActions } from './config'

export default {
  components: {
    Separator,
    CurSelect,
    FolderSetting,
    Uploader
  },
  computed: {
    imageActions () {
      return getImageActions(this.$t)
    },
    imageInsertAction: {
      get: function () {
        return this.$store.state.preferences.imageInsertAction
      }
    }
  },
  methods: {
    onSelectChange (type, value) {
      this.$store.dispatch('SET_SINGLE_PREFERENCE', { type, value })
    }
  }
}
</script>

<style>
.pref-image {
  & .image-ctrl {
    font-size: 14px;
    margin: 20px 0;
    color: var(--editorColor);
    & label {
      display: block;
      margin: 20px 0;
    }
  }
}
</style>
