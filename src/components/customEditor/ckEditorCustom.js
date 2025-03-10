import React, { memo, useEffect, useRef } from 'react'
import { CKEditor } from 'ckeditor4-react'

function CKedtiorCustom({ data, onChangeData, height }) {
  const editorInstance = useRef(null)

  useEffect(() => {
    if (editorInstance.current && editorInstance.current.getData() !== data) {
      editorInstance.current.setData(data)
    }
  }, [data])
  return (
    <CKEditor
      config={{
        versionCheck: false,
        height: height,
        extraPlugins: ['justify', 'image2', 'colorbutton'],
        filebrowserBrowseUrl: 'https://media.vitinhnguyenkim.com.vn/ckfinder/ckfinder.html',
        filebrowserImageBrowseUrl:
          'https://media.vitinhnguyenkim.com.vn/ckfinder/ckfinder.html?type=Images',
        filebrowserUploadUrl:
          'https://media.vitinhnguyenkim.com.vn/ckfinder/core/connector/php/connector.php?command=QuickUpload&type=Files',
        filebrowserImageUploadUrl:
          'https://media.vitinhnguyenkim.com.vn/ckfinder/core/connector/php/connector.php?command=QuickUpload&type=Images',
      }}
      initData={data}
      onChange={(event) => {
        const newData = event.editor.getData()
        if (newData !== data) {
          onChangeData(newData)
        }
      }}
      onInstanceReady={(event) => {
        editorInstance.current = event.editor
        event.editor.setData(data)
      }}
    />
  )
}

export default CKedtiorCustom
