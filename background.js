const colors = ["blue", "turquoise", "green", "yellow", "orange", "red", "pink", "purple"];

class TabContainer {
  constructor() {
    this.identities = {};
    this.idPrefix = "~TC";
    this.lastColorIdx = 0;
    this.idIcon = "fingerprint";
  }

  nextContextColor() {
    this.lastColorIdx++;
    return colors[this.lastColorIdx % colors.length];
  }

  async createNewId() {
    const num = Object.keys(this.identities).length + 1;
    const name = this.idPrefix + num.toString();

    const identity = await browser.contextualIdentities.create({
      "name": name,
      "color": this.nextContextColor(),
      "icon": this.idIcon,
    });

    this.identities[identity.cookieStoreId] = true;

    return identity;
  }

  async openTab(url = undefined) {
    const identity = await this.createNewId();
    await browser.tabs.create({
      "cookieStoreId": identity.cookieStoreId,
      "url": url,
    });
  }

  async onClicked() {
    this.openTab();
  }

  init() {
    browser.contextualIdentities.query({})
      .then((identities) => {
        for (const identity of identities) {
          if (identity.name.startsWith(this.idPrefix)) {
            browser.contextualIdentities.remove(identity.cookieStoreId);
          }
        }

        console.log("disposable containers removed");
      }, (error) => {
        console.error("could not query contextual identities:", error);
      });
  }
}

const tc = new TabContainer();
tc.init();

browser.browserAction.onClicked.addListener(tc.onClicked.bind(tc));

browser.contextMenus.create(
  {
    id: "open-in-dc",
    title: "Open in disposable container",
    contexts: ["link"],
  },
  () => void browser.runtime.lastError,
);

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "open-in-dc") {
    tc.openTab(info.linkUrl);
  }
});


