#!/usr/bin/env python
#-*- coding: utf-8 -*-

import RPi.GPIO as GPIO
import time

led_pin=17

def main():
    GPIO.setwarnings(False)
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(led_pin, GPIO.OUT, initial=GPIO.LOW)

    # led_pin에 500Hz PWM 인스턴스 생성
    pwm_led = GPIO.PWM(led_pin, 500)

    # 듀티 사이클(duty cycle)을 0%(off)로 시작
    pwm_led.start(0)

    while True:
        # 0, 20, 40, 60, 80 (100 출력 안 함)
        for duty in range(0, 100, 20):
            pwm_led.ChangeDutyCycle(duty) # 듀티 사이클 변경
            print('LED 밝기: %3d' % duty)
            time.sleep(0.2)
        # 100, 80, 60, 40, 20 (0 출력 안 함)
        for duty in range(100, 0, -20):
            pwm_led.ChangeDutyCycle(duty) # 듀티 사이클 변경
            print('LED 밝기: %3d' % duty)
            time.sleep(0.2)

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        pass
    except Exception, e:
        print str(e)
    finally:
        GPIO.cleanup()
