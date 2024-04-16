import { Controller } from '@hotwired/stimulus'
import { patch } from '@rails/request.js'
import { loadScript } from './load_script'

export default class extends Controller {
  
  static values = {
    resourceName: String,
    paramName: {
      type: String,
      default: 'position'
    },
    responseKind: {
      type: String,
      default: 'html'
    },
    animation: Number,
    handle: String,
    sortableUrl: {
      type: String,
      default: "https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/Sortable.min.js"
    }
  }

  initialize () {
    this.onUpdate = this.onUpdate.bind(this)
  }

  connect = async () => {
    if (window.Sortable === undefined ) {
      await loadScript({"src": this.sortableUrlValue})
    }
    
    this.sortable = new window.Sortable(this.element, {
      ...this.defaultOptions,
      ...this.options
    })
  }

  disconnect () {
    this.sortable.destroy()
    this.sortable = undefined
  }

  async onUpdate ({ item, newIndex }) {
    if (!item.dataset.sortableUpdateUrl) return

    const param = this.resourceNameValue ? `${this.resourceNameValue}[${this.paramNameValue}]` : this.paramNameValue

    const data = new FormData()
    data.append(param, newIndex + 1)

    return await patch(item.dataset.sortableUpdateUrl, { body: data, responseKind: this.responseKindValue })
  }

  get options () {
    return {
      animation: this.animationValue || this.defaultOptions.animation || 150,
      handle: this.handleValue || this.defaultOptions.handle || undefined,
      onUpdate: this.onUpdate
    }
  }

  get defaultOptions () {
    return {}
  }
}