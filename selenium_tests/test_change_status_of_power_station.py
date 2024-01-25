import time

import unittest

from selenium.webdriver import Keys

unittest.TestLoader.sortTestMethodsUsing = None

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions
from selenium.webdriver.support.wait import WebDriverWait


class TestChangingStatusOfPowerStation():
    def setup_method(self, method):
        options = webdriver.EdgeOptions()
        options.add_argument('--headless')
        self.driver = webdriver.Edge(options=options)
        self.wait = WebDriverWait(self.driver, 90)
        self.start_test()

        self.vars = {}

    def start_test(self):
        self.driver.get("http://localhost/login")
        self.driver.set_window_size(1980, 1080)
        self.driver.find_element(By.XPATH, "//*[@id='login-input']").send_keys("admin")
        self.driver.find_element(By.XPATH, "//*[@id='password-input']").send_keys("password")
        self.driver.find_element(By.XPATH, "//*[@id=':r2:']").click()

    def teardown_method(self, method):
        self.driver.quit()

    def test_stop_power_station(self):
        self.wait.until(
            expected_conditions.presence_of_element_located((By.XPATH, "//a[contains(@class, 'selected')]")))
        self.driver.find_element(By.XPATH, "//a[@href='/power-stations']").click()

        self.wait.until(expected_conditions.presence_of_element_located((By.XPATH, "//*[@id=':r5:']")))
        self.driver.find_element(By.XPATH, "//*[@id=':r5:']").send_keys("Uruchomiona")

        time.sleep(5)

        self.wait.until(expected_conditions.presence_of_element_located((By.XPATH,
                                                                         "/html/body/div/div[2]/div[3]/main/div/div/div/div[2]/div[2]/div/div/div[1]/div[4]/div/span[1]/button")))
        self.driver.find_element(By.XPATH,
                                 "/html/body/div/div[2]/div[3]/main/div/div/div/div[2]/div[2]/div/div/div[1]/div[4]/div/span[1]/button").click()

        self.wait.until(expected_conditions.presence_of_element_located((By.XPATH, "//*[text()='Uruchomiona']")))
        self.driver.find_element(By.XPATH, "//*[text()='Uruchomiona']")

        self.wait.until(
            expected_conditions.presence_of_element_located((By.XPATH, "//button[contains(@aria-label, 'pracę')]")))
        self.driver.find_element(By.XPATH, "//button[contains(@aria-label, 'pracę')]").click()

        self.wait.until(expected_conditions.presence_of_element_located((By.XPATH, "//*[text()='Zatrzymana']")))
        self.driver.find_element(By.XPATH, "//*[text()='Zatrzymana']")

    def test_start_power_station(self):
        self.wait.until(
            expected_conditions.presence_of_element_located((By.XPATH, "//a[contains(@class, 'selected')]")))
        self.driver.find_element(By.XPATH, "//a[@href='/power-stations']").click()

        self.wait.until(expected_conditions.presence_of_element_located((By.XPATH, "//*[@id=':r5:']")))
        self.driver.find_element(By.XPATH, "//*[@id=':r5:']").send_keys("Zatrzymana")

        time.sleep(5)

        self.wait.until(expected_conditions.presence_of_element_located((By.XPATH,
                                                                         "/html/body/div/div[2]/div[3]/main/div/div/div/div[2]/div[2]/div/div/div[1]/div[4]/div/span[1]/button")))
        self.driver.find_element(By.XPATH,
                                 "/html/body/div/div[2]/div[3]/main/div/div/div/div[2]/div[2]/div/div/div[1]/div[4]/div/span[1]/button").click()

        self.wait.until(expected_conditions.presence_of_element_located((By.XPATH, "//*[text()='Zatrzymana']")))
        self.driver.find_element(By.XPATH, "//*[text()='Zatrzymana']")

        self.wait.until(
            expected_conditions.presence_of_element_located((By.CSS_SELECTOR, "svg[data-testid='PlayArrowIcon']")))
        self.driver.find_element(By.CSS_SELECTOR, "svg[data-testid='PlayArrowIcon']").click()

        self.wait.until(expected_conditions.presence_of_element_located((By.XPATH, "//*[text()='Uruchomiona']")))
        self.driver.find_element(By.XPATH, "//*[text()='Uruchomiona']")

    def test_disconnect_power_station(self):
        self.wait.until(
            expected_conditions.presence_of_element_located((By.XPATH, "//a[contains(@class, 'selected')]")))
        self.driver.find_element(By.XPATH, "//a[@href='/power-stations']").click()

        self.wait.until(expected_conditions.presence_of_element_located((By.XPATH, "//*[@id=':r5:']")))
        self.driver.find_element(By.XPATH, "//*[@id=':r5:']").send_keys("0000:0000:0000:0000:0000:0000:0000:0003")

        time.sleep(5)

        self.wait.until(expected_conditions.presence_of_element_located(
            (By.XPATH, "//button[contains(@aria-label, 'Disconnect')]")))
        self.driver.find_element(By.XPATH, "//button[contains(@aria-label, 'Disconnect')]").click()

        self.wait.until(expected_conditions.presence_of_element_located((By.XPATH, "//*[text() = 'Tak']")))
        self.driver.find_element(By.XPATH, "//*[text() = 'Tak']").click()

        self.wait.until(expected_conditions.presence_of_element_located(
            (By.XPATH, "//*[text() = 'Pomyślnie odłączono elektrownię od systemu']")))
        self.driver.find_element(By.XPATH, "//*[text() = 'Pomyślnie odłączono elektrownię od systemu']")

    def test_connect_power_station(self):
        self.start_test()

        self.wait.until(
            expected_conditions.presence_of_element_located((By.XPATH, "//a[contains(@class, 'selected')]")))
        self.driver.find_element(By.XPATH, "//a[@href='/power-stations']").click()

        self.wait.until(expected_conditions.presence_of_element_located((By.XPATH, "//*[text() = 'Dodaj nowe elektrownie']")))
        self.driver.find_element(By.XPATH, "//*[text() = 'Dodaj nowe elektrownie']").click()

        self.wait.until(
            expected_conditions.presence_of_element_located((By.XPATH, "//*[text() = 'Dodaj nową elektrownię']")))
        self.driver.find_element(By.XPATH, "//*[text() = 'Dodaj nową elektrownię']").click()

        self.wait.until(expected_conditions.presence_of_element_located((By.XPATH, "//div[@id=\'root\']/div[2]/div[3]/main/div/div/div/div[2]/div[2]/div/div/div/div/div/div/input")))
        element = self.driver.find_element(By.XPATH, "//div[@id=\'root\']/div[2]/div[3]/main/div/div/div/div[2]/div[2]/div/div/div/div/div/div/input")
        element.send_keys(Keys.BACKSPACE)
        element.send_keys("3")

        self.wait.until(expected_conditions.presence_of_element_located((By.XPATH,"//button[contains(@aria-label, 'Save')]")))
        self.driver.find_element(By.XPATH, "//button[contains(@aria-label, 'Save')]").click()

        self.wait.until(expected_conditions.element_to_be_clickable((By.XPATH, "//*[text() = 'Dodaj do systemu']")))
        self.driver.find_element(By.XPATH, "//*[text() = 'Dodaj do systemu']").click()