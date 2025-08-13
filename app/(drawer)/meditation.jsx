<TimerPickerModal
    hideHours
    hideSeconds  // 👈 This hides the seconds picker
    visible={pickerVisible}
    setIsVisible={setPickerVisible}
    onConfirm={(pickedDuration) => {
        const totalSeconds = (pickedDuration.minutes || 0) * 60;
        setTimeLeft(totalSeconds);
        setAlarmString(formatTime({ minutes: pickedDuration.minutes, seconds: 0 }));
        setPickerVisible(false);
    }}
    modalTitle="Set Alarm"
    closeOnOverlayPress
    styles={{
        theme: colorScheme === "dark" ? "dark" : "light"
    }}
    modalProps={{
        overlayOpacity: 0.2,
    }}
/>
