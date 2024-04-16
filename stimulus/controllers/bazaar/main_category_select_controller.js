import SelectController from "../slim_select_controller"

export default class extends SelectController {

    static values = {
        ...super.values,
        url: String,
    }

    submitBtnId = 'bazaar-submit-button'
    turboFrameId = 'server-categories'

    disableBtn = () =>  {
        const btn = document.getElementById(this.submitBtnId)
        if (btn) {
            btn.setAttribute('disabled', 'true')
        }
    }

    enableBtn = () => {
        const btn = document.getElementById(this.submitBtnId)
        if (btn) {
            btn.removeAttribute('disabled')
        }
    }

    checkForTurboLoadEvent = (e) => {
        if (e.target.id === this.turboFrameId) {
             this.enableBtn()  
        }
    }

    getOptionsForSlimSelect() {
        
        return {
            ...super.getOptionsForSlimSelect(),
            onChange: (info) => {
                const turboFrameContainer = document.getElementById('server-categories')
                
                if (turboFrameContainer === null) {
                    console.warn("turboFrameContainer not found. Ctrl+F 'turboFrameContainer' ")
                    return
                }

                this.disableBtn()

                turboFrameContainer.setAttribute('src', `${this.urlValue}?parent_server_category=${info.value}`)
                
                turboFrameContainer.innerHTML = "<div class='text-gray-600 text-sm mt-2'>Načítavaju sa podkategórie...</div>"

                // https://turbo.hotwired.dev/reference/frames#functions
                turboFrameContainer.reload()
                

                // Empty out properties container
                const propertyContainer = document.getElementById('property-selects')
                
                if (propertyContainer) {
                    propertyContainer.innerHTML = ""
                }

                // wait for frame to come
                document.addEventListener('turbo:frame-load', this.checkForTurboLoadEvent)
            }
        }

    }


    disconnect() {
        super.disconnect()
        document.removeEventListener("turbo:frame-load", this.checkForTurboLoadEvent)
    }

}
