Delight = {
  templateName: 'product',
  addedToCart: false,
  apiUrl: 'https://api-dev.delightglobal.io',
  appUrl: 'https://delight-custom-greenman-dev.fly.dev'
}

const delightHostPartnerId = "64116ad7a5b7f032f200605a"
const delightApiToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImhlbHBkZXNrQGdyZWVubWFuZ2FtaW5nLmNvbSIsImlkIjoiNjQxMTZhZDdhNWI3ZjAzMmYyMDA2MDVhIiwiaWF0IjoxNjc4ODYzMDYzLCJleHAiOjE5OTQ0MzkwNjN9.7kzhs6186pCUtvMKzRwnXc9DC1GzrZeEe6m319JG6GY"

if (window.location.href.includes("your-cart---order") == true) {
  Delight.templateName = 'cart'
} else {
  Delight.templateName = 'product'
}

let campaign = {}
let rewardProducts = []

// is used to store the free gifts once the user removed from the basket
let dislikeArray = []

// is used to check that "Remove Gift" is done by User or Automatically-i.e when the productCnt is zero
let isAutoRemove = false

// The global variable to store the reward and product count in the cart
let rewardCnt = 0
let productCnt = 0

let fshowWidgetAtProductPage = false

let fisAdding = false

const cartFormSelectors1 = [
  "section.your-cart-section"
]

const addToCartSelectors = [
  "[data-add-to-basket]",
]

const addToCartContainerSelectors = [
  ".btn-container-add-to-basket"
]

const prodQuantitySelectors1 = [
  ".col-xs-7", ".prod-quantity"
]

const prodQuantitySelectors2 = [
  ".col-xs-2", ".prod-quantity"
]

const prodPriceSelectors = [
  ".col-sm-3", ".col-md-3", ".hidden-xs", ".text-right", ".prices"
]

const prodRemoveItemSelectors = [
  ".col-xs-2", ".remove-container"
]

//add delight-widget
const delightCartWidget = document.createElement("delight-cart-widget")
delightCartWidget.innerText = "delight-cart-widget"
delightCartWidget.className = "delight__widget-container visually-hidden"
document.querySelector('body').appendChild(delightCartWidget)

// add css file
function addCss() {
  var cssId = 'delight-widget-css'  // you could encode the css path itself to generate id..
  if (!document.getElementById(cssId)) {
    var head = document.getElementsByTagName('head')[0]
    var link = document.createElement('link')
    link.id = cssId
    link.rel = 'stylesheet'
    link.type = 'text/css'
    link.href = `${Delight.appUrl}/web/css/delight-widget.css`
    link.media = 'all'
    head.appendChild(link)
  }
}
addCss()

if (typeof window.debounce === "undefined") {
  window.debounce = function (fn, wait) {
    let t
    return (...args) => {
      clearTimeout(t)
      t = setTimeout(() => fn.apply(this, args), wait)
    }
  }
}

if (typeof window.fetchConfig === "undefined") {
  window.fetchConfig = (type = "json") => {
    return {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: `application/${type}`
      }
    }
  }
}

//Get rewards with catalogId and pageurl
async function getRewardProducts(rewards) {
  let arr = []
  if (!rewards) return arr

  let ipAddress = ''
  let iso_code = ''
  let countryName = ''
  const response = await fetch('https://api.ipify.org')
  if (response.ok) {
    ipAddress = await response.text()
  }
  if(ipAddress == '') return arr

  if(!(/^([0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ipAddress)) || ipAddress == "127.0.0.1" || ipAddress == location.hostname) return arr

  const url = `https://ipinfo.io/${ipAddress}/json`
  const response1 = await fetch(url)
  if(response1.ok) {
    const data = await response1.json()
    iso_code = data.country
  }
  if(iso_code == '') return arr

  const response2 = await fetch(`https://restcountries.com/v3.1/alpha/${iso_code}`)
  if(response2.ok) {
    const data = await response2.json()
    countryName = data[0].name.common
  }
  if(countryName == '') return

  console.log(countryName)
  rewards.map((reward) => {
    if (!reward.customInfos) return
    let isInfo = false
    let idx = 0
    for (idx = 0; idx < reward.customInfos.length; idx++) {
      if (reward.customInfos[idx].hostPartner.id == delightHostPartnerId) {
        isInfo = true
        break
      }
    }
    const countryList = reward.redemption
    if (isInfo && reward.redemption && countryList.includes(countryName)) {
      reward.catalogId = reward.customInfos[idx].data.catalogId
      reward.pageurl = reward.customInfos[idx].data.pageurl
      arr.push(reward)
    }
  })
  return arr
}

// count for rewards and products in cart
function getSelRewardCnt() {
  let itemCount = 0
  rewardCnt = 0
  productCnt = 0
  if(Delight.templateName === 'product') {
    const cartElement = document.querySelector('.cart-content')
    itemCount = cartElement?.querySelectorAll('li').length
    if(!cartElement) return
    rewardProducts.forEach((reward) => {
      const tdVariantElements = cartElement?.querySelectorAll(
        `a[href*="${reward.pageurl}"]`
      )
      if (tdVariantElements?.length > 0) {
        rewardCnt++
      }
    })
    if(itemCount < rewardCnt) return
    productCnt = itemCount - rewardCnt
  } else if (Delight.templateName === 'cart') {
    const basketContainerElement = document.querySelector('.delight-basket-table')
    const basketTableElement = basketContainerElement?.querySelector('ul.table-cart')
    if(!basketTableElement) return
    itemCount = basketTableElement.querySelectorAll('li').length
    rewardProducts.forEach((reward) => {
      const tdVariantElements = document.querySelectorAll(
        `a[href*="${reward.pageurl}"]`
      )
      if (tdVariantElements?.length > 0) {
        rewardCnt++
        const parts = reward.pageurl.split("/")
        if(parts?.length<3) return
        const myValue = parts[2]
        const delightWidgetElement = document.querySelector(
          `#product-form-${myValue}`
        )
        if(delightWidgetElement) {
          const submitButton = delightWidgetElement.querySelector('.product-form__submit.button')
          if(submitButton) {
            submitButton.setAttribute("disabled", true)
          }
        }
      } else {
        const parts = reward.pageurl.split("/")
        if(parts?.length<3) return
        const myValue = parts[2]

        const delightWidgetElement = document.querySelector(
          `#product-form-${myValue}`
        )
        if(delightWidgetElement) {
          const submitButton = delightWidgetElement.querySelector('.product-form__submit.button')
          if(submitButton) {
            submitButton.removeAttribute("disabled")
          }
        }
      }
    })
    if(itemCount < rewardCnt) return
    productCnt = itemCount - rewardCnt
  }
}

function isRewardInCart(reward) {
  const cartElement = document.querySelector('.cart-content')
  const tdVariantElements = cartElement?.querySelectorAll(
    `a[href*="${reward.pageurl}"]`
  )

  if (tdVariantElements?.length > 0) {
    for(let idx=0; idx<tdVariantElements.length; idx++) {
      const imageElement = tdVariantElements[idx].querySelector('.prod-image')
      const nameElement = tdVariantElements[idx].querySelector('.prod-name')
      const quantityElement = tdVariantElements[idx].querySelector('.prod-quantity')
      if(imageElement && nameElement && quantityElement) {
        return true
      } else {
        return false
      }
    }
  }
  return false
}

//Show the Banner Illustrations on the "<cart page>"
function showBannerIllustartion() {
  if (campaign?.showRewardBanner && Delight.templateName === 'cart') {
    const oldBanner = document.querySelector('#delight_banner_unique_id')
    if (oldBanner) oldBanner.remove()

    let rewardCnt = 0
    let rewardAddedCnt = 0
    let productAddedCnt = 0
    const delightProductForms = document.querySelectorAll(
        "delight-product-form"
    )
    delightProductForms.forEach((form) => {
        const formVariantId = form.querySelector('input[name="pageurl"]').value
        const tdVariantElements = document.querySelectorAll(
            `a[href*="${formVariantId}"]`
        )
        if (tdVariantElements?.length > 0) {
            rewardAddedCnt++
        } else {
            productAddedCnt++
        }
    })

    if(productAddedCnt > 0 && campaign.rewards.length >= rewardAddedCnt) {
      rewardCnt = rewardProducts.length-rewardAddedCnt
    }

    let cartFormElement = document.querySelector(cartFormSelectors1)
    if (!cartFormElement) return

    const cartFormElementParent = cartFormElement.parentNode
    const newBanner = document.createElement("div")
    newBanner.id = 'delight_banner_unique_id'
    let strBanner = ''
    if(rewardCnt > 0 && rewardCnt < rewardProducts.length) {
      strBanner = `<div class="outter">
        <div class="inner">
          <img src="${Delight.appUrl}/web/images/icon-check.svg" width="20" height="20">
          <div>You have qualified for <span class="rewad-cnt">${rewardCnt}</span> more free gift(s)</div>
        </div>
      </div>`
    } else if (rewardCnt == 0) {
        strBanner = `<div class="outter">
            <div class="inner">
                <img src="${Delight.appUrl}/web/images/icon-check.svg" width="20" height="20">
                <div>You have added all available <span class="rewad-cnt"></span> free gift(s)</div>
            </div>
        </div>`
    } else {
      strBanner = `<div class="outter">
        <div class="inner">
          <img src="${Delight.appUrl}/web/images/icon-check.svg" width="20" height="20">
          <div>You have qualified for <span class="rewad-cnt">${rewardCnt}</span> free gift(s)</div>
        </div>
      </div>`
    }

    newBanner.innerHTML = strBanner
    cartFormElementParent.insertBefore(newBanner, cartFormElement)
  }
}

//Hide the quantity of the Reward in the <"cart dropdown" of product page> and <"cart page">
function hideRewardQuantity() {
  console.log("hide quantity")
  rewardProducts.forEach((reward) => {
    const tdVariantElements = document.querySelectorAll(
      `a[href*="${reward.pageurl}"]`
    )
    if (tdVariantElements?.length > 0) {
      tdVariantElements.forEach((tdVariantElement) => {
        if (Delight.templateName === 'product') {
          const trQuantityInputs = tdVariantElement.querySelectorAll(
            ".prod-quantity"
          )
          if (!trQuantityInputs) return
          for (let idx = 0; idx < trQuantityInputs.length; idx++) {
            const giftLabel = document.createElement("div")
            giftLabel.classList.add('delight__gift--label___delight-wrapper')
            giftLabel.innerHTML = `
              <div class="delight__gift--label___delight-cart">
                <img src="${Delight.appUrl}/web/images/icon-gift.svg" style="filter:invert(1)" width="15" height="15">
                <span style="margin-top:5px">Free Gift</span>
              </div>`
            trQuantityInputs[idx].innerHTML = ""
            trQuantityInputs[idx].classList?.add('delight__gift--label___padding-top')
            trQuantityInputs[idx].appendChild(giftLabel)
            // trQuantityInputs[idx].classList?.add("delight__widget-quantity-disabled")
          }

          const removeButtonContainerElements = document.querySelectorAll(prodRemoveItemSelectors.join(""))
          removeButtonContainerElements?.forEach((removeButtonContainerElement) => {
            const removeButtonElement = removeButtonContainerElement.querySelector('a')
            if(removeButtonElement) {
              removeButtonElement.addEventListener("click", handleExternalRemoveFromCartButtonClick, { capture: true })
            }
          })
        } else if (Delight.templateName === 'cart') {
          let trQuantityInputs = tdVariantElement.querySelector(
            ".info-int"
          )
          if (!trQuantityInputs) return
          if (trQuantityInputs.querySelector('.delight__gift--label___delight-wrapper-cart')) return

          let customElement0 = trQuantityInputs?.querySelector(".prod-name")
          let customElement1 = trQuantityInputs?.querySelector("platform-names")
          let customElement2 = trQuantityInputs?.querySelector(".prod-drm")
          let prodName = customElement0?.textContent

          if(customElement0) {
            trQuantityInputs.removeChild(customElement0)
          }
          if(customElement2) {
            trQuantityInputs.removeChild(customElement2)
          }
          if(customElement1) {
            trQuantityInputs.removeChild(customElement1)
            var element = customElement1.querySelector('.prod-platform span')
            element.textContent = prodName
          }

          const giftLabel = document.createElement("div")
          giftLabel.classList.add('delight__gift--label___delight-wrapper-cart')
          giftLabel.innerHTML = `
            <div class="delight__gift--label___delight-cartpage">
              <img src="${Delight.appUrl}/web/images/icon-gift.svg" style="filter:invert(1)" width="15" height="15">
              <span>Free Gift</span>
            </div>`

          giftLabel.style.marginLeft = ''
          giftLabel.style.marginRight = ''
          giftLabel.style.alignItems = ''

          trQuantityInputs.appendChild(giftLabel)
          trQuantityInputs.appendChild(customElement1)

          const parentElement = tdVariantElement?.parentNode
          if(!parentElement) return
          const gparentElement = parentElement.parentNode
          if(!gparentElement) return

          let prodQuantityElement1 = gparentElement?.querySelector(
            prodQuantitySelectors1.join("")
          )
          if(prodQuantityElement1) {
            prodQuantityElement1.classList.add("delight__widget-quantity-disabled")
          }

          let prodQuantityElement2 = gparentElement?.querySelector(
            prodQuantitySelectors2.join("")
          )

          if(prodQuantityElement2) {
            const customElement = document.createElement("div")
            customElement.classList.add("delight__widget-quantity-disabled")
            const preChildElements = prodQuantityElement2.children
            for (let cidx = 0; cidx < preChildElements.length; cidx++) {
              customElement.appendChild(preChildElements[cidx])
            }
            prodQuantityElement2.innerHTML = ""
            prodQuantityElement2.appendChild(customElement)
          }

          let prodPriceElement = gparentElement.querySelector(
            prodPriceSelectors.join("")
          )
          if(prodPriceElement) {
            const customElement = document.createElement("div")
            customElement.classList.add("delight__widget-quantity-disabled")
            const preChildElements = prodPriceElement.children
            for (let cidx = 0; cidx < preChildElements.length; cidx++) {
              customElement.appendChild(preChildElements[cidx])
            }
            prodPriceElement.innerHTML = ""
            prodPriceElement.appendChild(customElement)
          }
        }
      })
    }
  })
}

// if no normal products in cart, remove all rewards
function removeRewards() {
  if(productCnt == 0) {
    if(Delight.templateName === 'product') {
      const cartElement = document.querySelector('.cart-content')
      const removeContainerElements = cartElement?.querySelectorAll('.remove-container')
      for(let idx = 0; idx < removeContainerElements?.length; idx++) {
        const removeContainerElement = removeContainerElements[idx]
        const removeElement = removeContainerElement.querySelector('a')
        if(removeElement) {
          isAutoRemove = true
          removeElement.click()
          removeElement.removeAttribute("ng-click")
          removeElement.addEventListener("click", function(event) {
            event.preventDefault()
          })
          removeElement.classList.add("disabled")
          isAutoRemove = false
        }
      }
    } else if (Delight.templateName === 'cart') {
      const basketContainerElement = document.querySelector('.delight-basket-table')
      const basketTableElement = basketContainerElement?.querySelector('ul.table-cart')
      if(!basketTableElement) return
      const trashElements = basketTableElement.querySelectorAll('.remove-container.hidden-xs')
      for(let idx=0; idx<trashElements.length; idx++) {
        const removeContainerElement = trashElements[idx]
        const removeElement = removeContainerElement.querySelector('a')
        if(removeElement) {
          isAutoRemove = true
          removeElement.click()
          removeElement.removeAttribute("ng-click")
          removeElement.addEventListener("click", function(event) {
            event.preventDefault()
          })
          removeElement.classList.add("disabled")
          isAutoRemove = false
        }
      }
    }
    productCnt = 0
    rewardCnt = 0
  }
}


// Automatically Remove rewards that the user once remove from the cart
function removeDislikeRewards() {
  if (Delight.templateName === 'product') {
    // const storedValue = window.localStorage.getItem('Dislikes')
    // let dislikeArray = []
    // if(storedValue != null) {
    //   dislikeArray = JSON.parse(storedValue)
    // }
    const cartElement1 = document.querySelector('.cart-content')
    rewardProducts.forEach((reward) => {
      if(dislikeArray.includes(reward.pageurl)) {
        const tdVariantElement = cartElement1?.querySelector(
          `a[href*="${reward.pageurl}"]`
        )

        if(!tdVariantElement) return
        const cartElement = tdVariantElement.parentNode
        if(!cartElement) return
        const removeContainerElements = cartElement?.querySelectorAll('.remove-container')
        for(let idx = 0; idx < removeContainerElements.length; idx++) {
          const removeContainerElement = removeContainerElements[idx]
          const removeElement = removeContainerElement.querySelector('a')
          if(removeElement) {
            removeElement.click()
          }
        }
      }
    })
  }
}

//initialize the localstorage from the basket
function getAddedRewards() {
  let addedRewards = []

  if(Delight.templateName === 'product') {
    const cartElement = document.querySelector('.cart-content')
    if(!cartElement) return
    rewardProducts.forEach((reward) => {
      const tdVariantElements = cartElement?.querySelectorAll(
        `a[href*="${reward.pageurl}"]`
      )
      if (tdVariantElements?.length > 0) {
        addedRewards.push(reward.pageurl)
      }
    })
  } else if (Delight.templateName === 'cart') {
    const basketContainerElement = document.querySelector('.delight-basket-table')
    const basketTableElement = basketContainerElement?.querySelector('ul.table-cart')
    if(!basketTableElement) return
    itemCount = basketTableElement.querySelectorAll('li').length
    rewardProducts.forEach((reward) => {
      const tdVariantElements = document.querySelectorAll(
        `a[href*="${reward.pageurl}"]`
      )
      if (tdVariantElements?.length > 0) {
        addedRewards.push(reward.pageurl)
      }
    })
  }
  window.localStorage.setItem("added", JSON.stringify(addedRewards))
}

function addNewEventlistener() {
  if(Delight.templateName === 'product') {
    if(fshowWidgetAtProductPage && !fisAdding) {
      const addButtonContainerElements = document.querySelectorAll(addToCartSelectors.join(''))
      addButtonContainerElements?.forEach((addButtonContainerElement) => {
        addButtonContainerElement.addEventListener("click", handleExternalAddToCartButtonClick, { capture: true, once: true })
      })
    }
  }
}

isAddBtnEnabled = false
function updateQuantity() {
  let m = 0
  let stateCheck = setInterval(async () => {
    getSelRewardCnt()
    removeRewards()
    removeDislikeRewards()
    showBannerIllustartion()
    hideRewardQuantity()
    addNewEventlistener()

    //check if add cart delight button inactive
    if(window.location.href.includes("products") == true  && !isAddBtnEnabled) {
      if (document.querySelector('button.delight-cloned')?.classList?.contains("button-inactive") == false) {
        isAddBtnEnabled = true
      } else {
        if (!document.querySelector('button.delight')?.classList?.contains("button-inactive") && document.querySelector('button.delight-cloned')?.classList?.contains("button-inactive")) {
          document.querySelector('button.delight-cloned')?.classList?.remove('button-inactive')
          isAddBtnEnabled = true
        }
      }
    }

    if (m === 10) {
      clearInterval(stateCheck)
    }
    m++
  }, 500)
}

const debouncedOnChange = debounce(() => {
  updateQuantity()
}, 1000)

document.addEventListener(
  "click",
  debouncedOnChange.bind(this)
)

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

function setDelightWidgetDetail() {
  if (!customElements.get("delight-product-detail-modal")) {
    customElements.define(
      "delight-product-detail-modal",
      class DelightProductDetailModal extends HTMLElement {
        constructor() {
          super()

          this.querySelector(
            '[id^="DelightProductDetailModalClose-"]'
          ).addEventListener("click", this.hide.bind(this, false))

          this.addEventListener("keyup", (event) => {
            if (event.code.toUpperCase() === "ESCAPE") this.hide()
          })

          this.querySelectorAll(
            ".delight__widget-modal--content-toggle-btn"
          ).forEach((btn) =>
            btn.addEventListener("click", this.toggleContent.bind(this))
          )

          if (this.classList.contains("media-modal")) {
            this.addEventListener("pointerup", (event) => {
              if (
                event.pointerType === "mouse" &&
                !event.target.closest("deferred-media, product-model")
              )
                this.hide()
            })
          } else {
            this.addEventListener("click", (event) => {
              if (event.target === this) this.hide()
            })
          }
        }

        connectedCallback() {
          if (this.moved) return
          this.moved = true
          document.body.appendChild(this)
        }

        show(opener) {
          this.openedBy = opener
          document.body.classList.add("overflow-hidden")
          this.setAttribute("open", "")
        }

        hide() {
          document.body.classList.remove("overflow-hidden")
          document.body.dispatchEvent(new CustomEvent("modalClosed"))
          this.removeAttribute("open")
        }

        toggleContent(event) {
          const parentElement = event.target.closest(
            ".delight__widget-modal--content-details"
          )
          const content = parentElement.querySelector(
            ".delight__widget-modal--content-details-wrapper"
          )
          if (parentElement.classList.contains("collapsed")) {
            content.style.height = content.scrollHeight + "px"
          } else {
            content.style.height = 0
          }
          parentElement.classList.toggle("collapsed")
        }
      }
    )
  }

  if (!customElements.get("delight-modal-opener")) {
    customElements.define(
      "delight-modal-opener",
      class DelightModalOpener extends HTMLElement {
        constructor() {
          super()
          const button = this.querySelector("button")
          if (!button) return
          // Clone the button element
          const newButton = button.cloneNode(true);
          // Replace the original button with the cloned button
          button.replaceWith(newButton);

          newButton.addEventListener("click", (event) => {
            event.preventDefault()
            const modal = document.querySelector(this.getAttribute("data-modal"))
            if (modal) {
              modal.show()
            }
          })
        }
      }
    )
  }

  if (!customElements.get("delight-product-form")) {
    customElements.define(
      "delight-product-form",
      class DelightProductForm extends HTMLElement {
        constructor() {
          super()

          this.form = this.querySelector("form");
          this.form.addEventListener("submit", this.onSubmitHandler.bind(this));
          this.submitButton = this.querySelector('[type="submit"]');
        }

        async onSubmitHandler(evt) {
          evt.preventDefault()
          if (this.submitButton.getAttribute("disabled") === "true") return

          this.handleErrorMessage()

          this.submitButton.setAttribute("disabled", true)
          this.submitButton.classList.add("loading")
          this.querySelector(".loading-overlay__spinner").classList.remove(
            "hidden"
          )

          let catalogId = this.form.querySelector('[name=catalogId]').value
          let pageurl = this.form.querySelector('[name=pageurl]').value
          const tdVariantElements = document.querySelectorAll(
            `a[href*="${pageurl}"]`
          )
          if (tdVariantElements?.length > 0) return

          //add to basket
          const res = await fetch(
            `https://api.greenmangaming.com/api/v2/cart/add_to_basket/`,
            {
              method: "POST",
              credentials: 'include',
              headers: {
                'Content-Type': "application/json"
              },
              body: JSON.stringify({
                "catalogId": catalogId
              })
            }
          )
          if(res.ok)
            window.location.reload()
        }

        handleErrorMessage(errorMessage = false) {
          console.log(errorMessage)
        }
      }
    )
  }
}

async function handleExternalRemoveFromCartButtonClick(event) {
  event.preventDefault()
  if(isAutoRemove) {
    isAutoRemove = false
    return
  }
  // const storedValue = window.localStorage.getItem('Dislikes')
  // let dislikeArray = []
  // if(storedValue != null) {
  //   dislikeArray = JSON.parse(storedValue)
  // }
  const parentElement = event.target.parentNode
  if(!parentElement) return
  const gparentElement = parentElement.parentNode
  if(!gparentElement) return
  const ggparentElement = gparentElement.parentNode
  if(!ggparentElement) return

  const hrefValue = ggparentElement.querySelector('a').href
  const url = new URL(hrefValue);
  const path = url.pathname;

  if(dislikeArray.includes(path)) return
  rewardProducts.forEach(async (reward) => {
    if(path == reward.pageurl) {
      dislikeArray.push(path)
      // window.localStorage.setItem('Dislikes', JSON.stringify(dislikeArray))
      return
    }
  })
}

async function handleExternalAddToCartButtonClick(event) {
  fisAdding = true
  event.preventDefault()
  event.stopPropagation()
  if (rewardCnt < rewardProducts.length) {
    const apiResponsePromises = rewardProducts.map(async (reward) => {
      if (isRewardInCart(reward)) {
        return
      }
      const apiResponse = await fetch(
        `https://api.greenmangaming.com/api/v2/cart/add_to_basket/`,
        {
          method: "POST",
          credentials: 'include',
          headers: {
            'Content-Type': "application/json"
          },
          body: JSON.stringify({
            "catalogId": reward.catalogId
          })
        }
      )
      if (apiResponse.ok) {
        window.delightProductAdded = true
      } else {
        window.delightProductAdded = false
      }
    })
    await Promise.all(apiResponsePromises) // wait for all API requests to complete
    // await new Promise(resolve => setTimeout(resolve)); // delay to allow the event loop to catch up
    fisAdding = false
    event.target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  } else {
    event.target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }
}


if (!customElements.get("delight-widget")) {
  async function init() {
    // Get campaign
    const res = await fetch(
      `${Delight.apiUrl}/campaigns/connect/${delightHostPartnerId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${delightApiToken}`,
          "Content-Type": "application/json",
        }
      }
    )

    if (!res.ok) return
    const result = await res.json()

    const { campaigns } = result
    if (!campaigns || campaigns.length == 0) return

    campaign = campaigns[0]

    rewardProducts = await getRewardProducts(campaign.rewards)

    const {
      showWidgetAtCartPage,
      showWidgetAtProductPage,
      status
    } = campaign

    if(showWidgetAtProductPage) fshowWidgetAtProductPage = true
    else fshowWidgetAtProductPage = false

    if (status !== "active") return

    customElements.define(
      "delight-cart-widget",
      class DelightCartWidget extends HTMLElement {
        constructor() {
          super()

          if (showWidgetAtCartPage && Delight.templateName === 'cart') {
            this.classList.remove("visually-hidden")

            let headHtml = `
              <div class="delight__widget-head">
                <div class="delight__widget-head-content">
                    <div class="delight__widget-title">
                        <img src="${Delight.appUrl}/web/images/icon-gift.svg" style="filter:invert(1)">
                        <h4 class="delight__widget-headline">Your free gifts at checkout!</h4>
                    </div>
                </div>
                  <div class="delight__widget-content-arrow-wrapper">
                      <span id="delight__widget-content-btn" class="delight__widget-content-btn cursor-pointer">
                          <img
                              src="${Delight.appUrl}/web/images/icon-cheveron-up.svg" style="filter:invert(1)">
                      </span>
                  </div>
              </div>`
            getSelRewardCnt()
            let selCount = rewardCnt
            let totalCount = rewardProducts.length

            let bodyHtml = `
              <div class="delight__widget-body">
              <div class="delight__widget-qualified-message">
                  Qualified<img
                      src="${Delight.appUrl}/web/images/icon-delight-qualified.svg">(over
                  $0.01 cost spent)
              </div>
              <small
                  class="delight__widget-qualified-small-message">
                  <strong>${selCount}/${totalCount}</strong>
                  free gifts selected</small>
              <ul id="delight__widget-content" class="delight__widget-main-items">`


            let liHtml = ''
            rewardProducts.forEach((reward) => {
              const parts = reward.pageurl.split("/")
              if(parts?.length<3) return
              const myValue = parts[2]
              liHtml += `
                <li class="delight__widget-item">
                  <div class="delight__widget-item-desc">
                      <img src="${reward.images[0]?.url}" alt="2 FREE gifts on ALL orders" loading="lazy" width="70"
                          height="70" class="delight__widget-item-image">
                      <div class="delight__widget-item-content">
                          <div class="cart-item__name h4 break">${reward.headline}</div>
                          <div class="delight__gift--label___delight">
                            <img src="${Delight.appUrl}/web/images/icon-gift.svg" style="filter:invert(1);">
                            <span>Free gift from Greenman Gaming</span>
                          </div>
                      </div>
                  </div>

                  <div class="delight__widget-actions">
                      <delight-product-form>
                          <form method="post" action="" id="product-form-${myValue}"
                              accept-charset="UTF-8"
                              class="form" enctype="multipart/form-data" novalidate="novalidate"
                              data-type="add-to-cart-form">
                              <input type="hidden" name="catalogId" value="${reward.catalogId}">
                              <input type="hidden" name="pageurl" value="${reward.pageurl}">
                              <div class="product-form__buttons">
                                  <button type="submit" name="add" class="product-form__submit button" >
                                      <img
                                          src="${Delight.appUrl}/web/images/icon-delight-add-bag.svg" style="width:15px; height:15px;">
                                      <div class="loading-overlay__spinner hidden">
                                          <svg aria-hidden="true" focusable="false" role="presentation"
                                              class="delight-spinner"
                                              viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
                                              <circle class="path" stroke-width="6" cx="33" cy="33" r="30"></circle>
                                          </svg>
                                      </div>
                                  </button>
                              </div>
                          </form>
                      </delight-product-form>

                      <delight-product-detail-modal id="DelightProductDetailModal-${reward.id}">
                          <div class="delight__widget-modal" role="dialog" tabindex="-1"
                              aria-label="${reward.headline}" aria-modal="true">
                              <div class="delight__widget-modal-content">
                                  <span id="DelightProductDetailModalClose-${reward.id}"
                                      class="delight__widget-close-button">×</span>
                                  <div class="delight__widget-modal--image-wraper">
                                      <img src="${reward.images[0]?.url}"
                                          alt="" loading="lazy" width="500"
                                          height="500"
                                          class="delight__widget-modal--image">
                                  </div>
                                  <div class="delight__widget-modal--content-wrapper">
                                      <h2 class="delight__widget-modal--content-heading">Product Details</h2>
                                      <h3 class="delight__widget-modal--content-headline">${reward.headline}></h3>
                                      <div class="delight__widget-modal--content-details">
                                          <h4>
                                              <span>Product Overview</span>
                                              <span class="delight__widget-modal--content-toggle-btn">
                                                  <img src="${Delight.appUrl}/web/images/icon-cheveron-up.svg">
                                              </span>
                                          </h4>
                                          <div class="delight__widget-modal--content-details-wrapper">
                                              ${reward.description}
                                          </div>
                                      </div>
                                      <div class="delight__widget-modal--content-details">
                                          <h4>
                                              <span>Terms and Policy</span>
                                              <span class="delight__widget-modal--content-toggle-btn">
                                                  <img src="${Delight.appUrl}/web/images/icon-cheveron-up.svg">
                                              </span>
                                          </h4>
                                          <div class="delight__widget-modal--content-details-wrapper">
                                              ${reward.terms}
                                              <a class="text-link" href="${reward.url}"
                                                  target="_blank">Learn more</a>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </delight-product-detail-modal>
                      <delight-modal-opener data-modal="#DelightProductDetailModal-${reward.id}">
                          <button id="delight__widget-info-btn-${reward.id}" aria-haspopup="dialog">
                              <img src="${Delight.appUrl}/web/images/icon-delight-info.svg" style="width:15px; height:15px;">
                              <div class="loading-overlay__spinner hidden">
                                  <svg aria-hidden="true" focusable="false"
                                      role="presentation" class="delight-spinner"
                                      viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
                                      <circle class="path"
                                          fill="none" stroke-width="6"
                                          cx="33" cy="33" r="30"></circle>
                                  </svg>
                              </div>
                          </button>
                      </delight-modal-opener>
                  </div>
                </li>
              `
            })

            bodyHtml += liHtml + '</ul></div>'

            this.innerHTML = headHtml + bodyHtml
            const cartFormElement = document.querySelector(
              cartFormSelectors1.join(",")
            )

            const cartFormElementParent = cartFormElement?.parentNode

            const widgetContainer = document.createElement("div")

            cartFormElementParent.insertBefore(widgetContainer, cartFormElement.previousSibling)
            cartFormElement.classList.add('delight-basket-table')
            widgetContainer.appendChild(cartFormElement)
            widgetContainer.appendChild(this)

            setDelightWidgetDetail()
          }

          // update the UI and Property
          updateQuantity()
        }

        connectedCallback() {
          if (Delight.templateName === 'cart') {
            if(showWidgetAtCartPage) {
              this.contentBtn = document.getElementById(
                "delight__widget-content-btn"
              )
              this.contentBtn.addEventListener("click", this.toggleContent)
            }

            // Handle the button click when the "RemoveItem" button is clicked in the cart page
            const basketContainerElement = document.querySelector('.delight-basket-table')
            const basketTableElement = basketContainerElement?.querySelector('ul.table-cart')
            if(!basketTableElement) return
            const trashElements = basketTableElement.querySelectorAll('.remove-container.hidden-xs')
            for(let idx=0; idx<trashElements.length; idx++) {
              const removeContainerElement = trashElements[idx]
              const removeElement = removeContainerElement.querySelector('a')
              if(removeElement) {
                removeElement.addEventListener("click", handleExternalRemoveFromCartButtonClick, { capture: true })
              }
            }
          }

          if (Delight.templateName === 'product') {
            // Handle the button click when the "Add to Cart" button is clicked
            if(fshowWidgetAtProductPage) {
              const addButtonContainerElements = document.querySelectorAll(addToCartSelectors.join(''))
              addButtonContainerElements?.forEach((addButtonContainerElement) => {
                addButtonContainerElement.addEventListener("click", handleExternalAddToCartButtonClick, { capture: true, once: true })
              })
            }

            // Handle the button click when the "RemoveItem" button is clicked in the cart dropdown of the product page
            const removeButtonContainerElements = document.querySelectorAll(prodRemoveItemSelectors.join(""))
            removeButtonContainerElements?.forEach((removeButtonContainerElement) => {
              const removeButtonElement = removeButtonContainerElement.querySelector('a')
              if(removeButtonElement) {
                removeButtonElement.addEventListener("click",handleExternalRemoveFromCartButtonClick, { capture: true })
              }
            })
          }
        }

        disconnectedCallback() {
          if (showWidgetAtCartPage && Delight.templateName === 'cart') {
            this.contentBtn.removeEventListener("click", this.toggleContent)
          }
        }

        toggleContent() {
          const content = document.getElementById("delight__widget-content")
          if (this.classList.contains("collapsed")) {
            content.style.height = content.scrollHeight + "px"
          } else {
            content.style.height = 0
          }
          this.classList.toggle("collapsed")
        }


      }
    )
  }

  init()
}
