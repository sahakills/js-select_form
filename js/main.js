let arFields = []
$(document).ready(function () {
    //собираем селекты
    let select = $(".select_render")
    if (select.length > 0) {
        select.each(function (index, htmlForm) {
            let oFields = new Select(htmlForm)
            arFields.push(oFields)
        })
    }
})

function sendFilter() {
    $(".catalog-filter").on("change" , function () {
        let $form = $(this)
        let dataForm = new FormData($(this).get(0))
        // let dataForm = $(this).serialize()
        dataForm.append("action" , "send_form_ajax_filter")
        $.ajax({
            type: $form.attr("method"),
            url: send_form_url,
            processData: false,
            contentType: false,
            // dataType: "json",
            data: dataForm,
            success: function(response){
                let $ajaxContainer = $("#filter-catalog-list")
                $ajaxContainer.empty()
                $ajaxContainer.append(response)
            }
        })
    })
}

class Select {
    constructor(select) {
        let $this = this
        $this = select
        if ($this.multiple) {
            return new SelectMultiple($this)
        } else {
            return new SelectDefault($this)
        }
    }
}

class SelectDefault {
    constructor(field) {
        this.field = field
        this.jqField = $(this.field)
        let $this = this
        $this.JqFirstItem = this.selectFirstItem($this)
        $this.firstItem = $this.JqFirstItem.text()
        $this.firstOption = {}
        $this.newItems = this.createElements($this)
        $this.newSelect = this.createSelect($this)
        $this.wrapNewItems = $("<div>" , {
            class: "custom_select-wrap"
        }).append($this.newItems)
        this.renderSelect($this)
        //выбираем первый выбранный или не выбранный элемент

        //добавляем события раскрытия
        this.addEvents($this)
    }

    addEvents($this) {
        //склик по списку
        $this.newSelect.on("click" , function () {
            if ($this.wrapNewItems.hasClass("active")) {
                $this.wrapNewItems.removeClass("active")
                $this.closeMenu($this.wrapNewItems)
            } else {
                $this.openMenu($this.wrapNewItems)
            }

            // $this.wrapNewItems.addClass("active")
        })
       this.eventChangeCheckbox($this)
        //TODO доделать проверку
        $(document).on("click" , function (event) {
            let div = $(".custom_select") // тут указываем ID элемента
            if ( !div.is(event.target) // если клик был не по нашему блоку
                && div.has(event.target).length === 0 ) {// и не по его дочерним элементам
                $this.closeMenu($this.wrapNewItems) // скрываем его
            }
        })
        // $this.newItems.find("input").on("change" , function () {
        //     console.log("change_element")
        // })
        //клик вне списка + проверка активный выпадающий список или нет
    }

    checkValue ($this) {
        return $this.wrapNewItems.find(":checked")
    }

    closeMenu(menuWrap) {
        menuWrap.removeClass("active")
    }

    openMenu(menuWrap) {
        menuWrap.addClass("active")
    }

    selectFirstItem ($this) {
        let firstItem = ""
        if ($this.jqField.val().length > 0 ) {
            firstItem = this.jqField.find("option:selected")
        } else {
            firstItem = $this.jqField.find("option").first()
        }
        return firstItem
    }

    createSelect($this) {
        let html = $("<div>", {
                class: "custom_select-selected"
            }).append(
                $("<span>", {
                    text: $this.firstItem
                }),
                $("<i>", {
                    class: "icon_drop-down"
                })
            )
        return html
    }

    createElements ($this) {
        let elements = $this.jqField.find("option")
        let newEl = []

        elements.each(function (index, element) {

            let newHtmlWrap = $("<div>" ,{
                class: "custom_select-wrap-input",
            }).prepend($("<label>" , {
                class: "controller-label",
                id: "custom_select-" + $this.field.name + "-" + index
            }).append(
                $("<input>" , {
                    class: "controller-input",
                    id: "custom_select-" + $this.field.name + "-" + index,
                    type: "radio",
                    name: $this.field.name,
                    value: element.value,
                }),
                $("<div>", {
                    class: "controller-radio"
                }),
                $("<span>" , {
                    class: "controller-text",
                    text: element.innerText
                })
            ))
            newEl.push(newHtmlWrap)
        })
        return newEl
    }

    renderSelect($this) {
        let htmlWrapTitle = $("<div>", {
            class: "custom_select"
        })
        htmlWrapTitle.append($this.newSelect)
        $this.jqField.after(htmlWrapTitle.append($this.wrapNewItems))
        $this.jqField.remove()
    }

    eventChangeCheckbox ($this) {

        $this.wrapNewItems.find("input").on("change" , function () {
            let selectedElement = $this.checkValue($this)
            if (selectedElement.length > 0) {
                let text = []
                selectedElement.each(function (index , element) {
                    text.push($(element).siblings(".controller-text").text())
                })
                $this.newSelect.find("span").empty().text(text)
            } else {
                $this.newSelect.find("span").empty().text($this.firstItem)

            }
        })
    }
}

class SelectMultiple extends SelectDefault{
    createElements ($this) {
        let elements = $this.jqField.find("option")
        let newEl = []
        elements.each(function (index, element) {
            let checkedInput = $(element).is(":selected")
            let newInput = $("<input>" , {
                class: "controller-input",
                id: "custom_select-" + $this.field.name + "-" + index,
                type: "checkbox",
                name: $this.field.name,
                value: element.value,
                checked: checkedInput
            })
            let newHtmlWrap = $("<div>" ,{
                class: "custom_select-wrap-input",
            }).prepend($("<label>" , {
                class: "controller-label",
                id: "custom_select-" + $this.field.name + "-" + index
            }).append(
                newInput,
                $("<div>", {
                    class: "controller-checkbox"
                }),
                $("<span>" , {
                    class: "controller-text",
                    text: element.innerText
                })
            ))
            if (checkedInput) {
                $this.firstOption = newInput
            }
            newEl.push(newHtmlWrap)
        })
        return newEl
    }

    checkValue ($this) {
        return $this.wrapNewItems.find(":checkbox:checked")
    }

    eventChangeCheckbox ($this) {
        $this.wrapNewItems.find("input").on("change" , function () {
            let selectedElement = $this.checkValue($this)
            if (selectedElement.length > 0) {
                $this.firstOption.prop('checked', false)
                let text = []
                selectedElement.each(function (index , element) {
                    let currentInput = $(element)
                    if (currentInput.is(":checked")) {
                        text.push(currentInput.siblings(".controller-text").text())
                    }
                })
                $this.newSelect.find("span").empty().text(text)
            } else {
                $this.firstOption.prop('checked', true)
                $this.newSelect.find("span").empty().text($this.firstItem)
            }
        })
    }
}