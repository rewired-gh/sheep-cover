const { Builder, By, Key, until, locateWith } = require("selenium-webdriver");
const CryptoJS = require("crypto-js");
const chrome = require("selenium-webdriver/chrome");
const config = require("./config.js");

// 注意：该脚本的设计侧重点在于【稳定性】与【可复用性】；因此，该脚本采用的方法并不能满足便捷性的需求

(async function main() {
  const statusMap = {
    "01": "在校（校内宿舍住）",
    "05": "在校（走读）",
    "02": "在校（校内隔离）",
    "07": "校外隔离",
    "04": "病假",
    "03": "事假",
    99: "其他",
  };

  let chromeOptions = new chrome.Options();
  if (config.isHeadless) {
    chromeOptions = chromeOptions
      .headless()
      .windowSize({ width: 1920, height: 1080 });
  }
  let driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(chromeOptions)
    .build();

  try {
    // Access URL
    await driver.get(
      "https://sso.hitsz.edu.cn:7002/cas/login?service=https%3A%2F%2Fstudent.hitsz.edu.cn%2Fcommon%2FcasLogin%3Fparams%3DL3hnX21vYmlsZS94c01yc2JOZXcvaW5kZXg%3D"
    );

    // Print info
    let title = await driver.getTitle();
    let url = await driver.getCurrentUrl();
    console.log("");
    console.log(title);
    console.log(url);

    // Check authentication
    if (url.match(/sso\.hitsz\.edu\.cn/i)) {
      let usernameInput = await driver.findElement(By.css("input#username"));
      let passwordInput = await driver.findElement(By.css("input#password"));
      let loginButton = await driver.findElement(
        By.css("input.login_box_landing_btn")
      );

      // Fill in blanks
      await usernameInput.sendKeys(config.username);
      await passwordInput.sendKeys(
        CryptoJS.AES.decrypt(config.maskedPassword, config.secretKey).toString(
          CryptoJS.enc.Utf8
        )
      );

      // Click login button
      await loginButton.click();

      // Print info
      title = await driver.getTitle();
      url = await driver.getCurrentUrl();
      console.log("");
      console.log(title);
      console.log(url);
    }

    // Check redirected site
    if (url.match(/student\.hitsz\.edu\.cn/i)) {
      // Click 每日上报 tab
      let mrsbTab = await driver.findElement(By.css("#mrsb_tab"));
      await mrsbTab.click();

      // Set 当前状态 with DOM
      if (config.enableSetCurrentStatus) {
        await driver.executeScript(setCurrentStatus, statusMap[config.statusCode], config.statusCode);
      }

      // Set 所在地点 by clicking
      if (config.enableSetGeolocation) {
        await driver.executeScript(setGeolocation, config.geolocation);
      }

      // Set 所在地点 brutally
      if (config.enableAutoGeolocation) {
        let hqwzAnchor = await driver.findElement(By.css("#dtjwd > a"));
        await hqwzAnchor.click();
      }

      // Fetch all check items
      let checkItemCells = await driver.findElements(
        By.xpath('//input[@class="weui-check" and not(@checked)]/../..')
      );

      // Match items and check
      for (cell of checkItemCells) {
        let label = await cell.findElement(By.css(".weui-cell__bd1"));
        let listTitle = await cell.findElement(
          By.xpath(
            './../../preceding::div[@class="pluginnames"][1]/span[position()=2]'
          )
        );
        let labelText = await label.getText();
        let listTitleText = await listTitle.getText();
        for (value of config.checkedList) {
          let isTitleSpecified = "title" in value;
          if (
            labelText.includes(value.item) &&
            (!isTitleSpecified || listTitleText.includes(value.title))
          ) {
            await cell.click();
          }
          if (isTitleSpecified) {
            break;
          }
        }
      }

      // Click 'guarantee' button
      let cnButton = await driver.findElement(
        By.xpath('//*[@id="txfscheckbox"]/..')
      );
      await cnButton.click();

      // Click submit button
      let submitButton = await driver.findElement(By.css(".submit"));
      await submitButton.click();

      console.log("");
      console.log("上报成功");
    } else {
      throw "Unexpected URL!";
    }
  } catch (error) {
    console.error(error);
  }

  // Quit browser
  await driver.quit();
})();

function setGeolocation(geolocation) {
  gpsjd = geolocation.longitude;
  gpswd = geolocation.latitude;
  kzl6 = geolocation.province;
  kzl7 = geolocation.city;
  kzl8 = geolocation.district;

  kzl38 = geolocation.province;
  kzl39 = geolocation.city;
  kzl40 = geolocation.district;
  kzl9 = geolocation.street;
  kzl10 = kzl6 + kzl7 + kzl8 + kzl9;

  $("#dtjwd a").text(kzl6 + kzl7 + kzl8);
  if (kzl7 != null && kzl7 != "" && kzl7_o != null && kzl7_o != "") {
    if (kzl7 != kzl7_o) {
      $("#kzl1-btwzyy-div").show();
    } else {
      $("#kzl1-btwzyy-div").hide();
    }
  }
}

function setCurrentStatus(statusCode, statusText) {
  const waitForElm = (selector) => {
    return new Promise(resolve => {
      if (document.querySelector(selector)) {
        return resolve(document.querySelector(selector));
      }

      const observer = new MutationObserver(mutations => {
        if (document.querySelector(selector)) {
          resolve(document.querySelector(selector));
          observer.disconnect();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    });
  }

  waitForElm('#dqzt').then(() => {
    document.querySelector('#dqzt').value = `${statusText}`;
    document.querySelector('#dqzt').attributes["data-action"].value = `${statusCode}`;
  });
}
