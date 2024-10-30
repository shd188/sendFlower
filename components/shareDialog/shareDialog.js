// components/modal/modal.js
Component({
  properties: {
    title: {
      type: String,
      value: '提示'
    },
    visible: {
      type: Boolean,
      value:false 
    }
  },

  methods: {
    onCancel() {
      this.triggerEvent('cancel');
    }
  }
});
