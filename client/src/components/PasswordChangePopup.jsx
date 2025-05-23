import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import userService from '../services/userService';
import '../styles/PasswordChangePopup.css';

const PasswordChangePopup = ({ isOpen, onClose }) => {
    const { user } = useUser();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        verificationCode: ''
    });
    const [errors, setErrors] = useState({});
    const [countdown, setCountdown] = useState(0);
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSendingCode, setIsSendingCode] = useState(false);

    useEffect(() => {
        // Đếm ngược cho OTP
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    useEffect(() => {
        // Reset form khi mở/đóng popup
        if (isOpen) {
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
                verificationCode: ''
            });
            setErrors({});
            setSuccessMessage('');
        }
    }, [isOpen]);

    const validate = () => {
        const newErrors = {};
        if (!formData.currentPassword) newErrors.currentPassword = 'Mật khẩu hiện tại là bắt buộc';
        if (!formData.newPassword) newErrors.newPassword = 'Mật khẩu mới là bắt buộc';
        else if (formData.newPassword.length < 8) newErrors.newPassword = 'Mật khẩu phải có ít nhất 8 ký tự';
        
        if (!formData.confirmPassword) newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
        else if (formData.confirmPassword !== formData.newPassword) 
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        
        if (!formData.verificationCode) newErrors.verificationCode = 'Mã xác thực là bắt buộc';
        else if (formData.verificationCode.length !== 6) newErrors.verificationCode = 'Mã xác thực phải có 6 số';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'verificationCode') {
            // Chỉ cho phép nhập số và tối đa 6 ký tự
            if (/^\d{0,6}$/.test(value)) {
                setFormData({ ...formData, [name]: value });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSendCode = async () => {
        try {
            if (!user || !user.email) {
                setErrors({
                    form: 'Không thể xác định email người dùng. Vui lòng làm mới trang.'
                });
                return;
            }

            setIsSendingCode(true);
            console.log('Gửi mã xác thực đến:', user.email);
            
            // Gọi trực tiếp đến service thay vì thông qua context
            await userService.sendVerificationCode(user.email);
            
            // Bắt đầu đếm ngược
            setCountdown(60);
            // Xóa lỗi nếu có
            setErrors(prev => {
                const newErrors = {...prev};
                delete newErrors.form;
                return newErrors;
            });
        } catch (error) {
            console.error('Lỗi gửi mã xác thực:', error);
            setErrors({
                form: error.message || 'Đã xảy ra lỗi khi gửi mã xác thực'
            });
        } finally {
            setIsSendingCode(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        
        // Xóa thông báo lỗi và thành công trước khi thực hiện yêu cầu
        setSuccessMessage('');
        setErrors({});
        
        try {
            // Đảm bảo user tồn tại và có email
            if (!user || !user.email) {
                setErrors({ form: 'Không thể xác định email người dùng. Vui lòng làm mới trang.' });
                return;
            }
            
            setIsLoading(true);
            
            // Gọi trực tiếp đến service thay vì thông qua context
            await userService.changePassword({
                email: user.email,
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
                verificationCode: formData.verificationCode
            });
            
            setSuccessMessage('Đổi mật khẩu thành công!');
            
            // Reset form sau khi thành công
            setTimeout(() => {
                setFormData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                    verificationCode: ''
                });
                setSuccessMessage('');
                onClose();
            }, 2000);
          
        } catch (error) {
            console.error('Lỗi đổi mật khẩu:', error);
            setErrors({ form: error.message || 'Đã xảy ra lỗi khi đổi mật khẩu' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="changepass-popup-overlay">
            <div className="changepass-popup-container">
                <div className="changepass-custom-text-h2">
                    <h2>Đổi mật khẩu</h2>
                </div>
                
                <form className="changepass-popup-form" onSubmit={handleSubmit}>
                    {successMessage && (
                        <div className="changepass-success-message">{successMessage}</div>
                    )}
                    
                    {errors.form && (
                        <div className="changepass-error-message">{errors.form}</div>
                    )}
                    
                    <div className="changepass-form-group">
                        <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
                        <div className="changepass-input-wrapper">
                            <input
                                type="password"
                                id="currentPassword"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                className={`changepass-input ${errors.currentPassword ? 'changepass-input-error' : ''}`}
                                placeholder="Nhập mật khẩu hiện tại"
                                disabled={isLoading || isSendingCode}
                            />
                        </div>
                        {errors.currentPassword && (
                            <div className="changepass-error">{errors.currentPassword}</div>
                        )}
                    </div>
                    
                    <div className="changepass-form-group">
                        <label htmlFor="newPassword">Mật khẩu mới</label>
                        <div className="changepass-input-wrapper">
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className={`changepass-input ${errors.newPassword ? 'changepass-input-error' : ''}`}
                                placeholder="Nhập mật khẩu mới"
                                disabled={isLoading || isSendingCode}
                            />
                        </div>
                        {errors.newPassword && (
                            <div className="changepass-error">{errors.newPassword}</div>
                        )}
                    </div>
                    
                    <div className="changepass-form-group">
                        <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
                        <div className="changepass-input-wrapper">
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`changepass-input ${errors.confirmPassword ? 'changepass-input-error' : ''}`}
                                placeholder="Xác nhận mật khẩu mới"
                                disabled={isLoading || isSendingCode}
                            />
                        </div>
                        {errors.confirmPassword && (
                            <div className="changepass-error">{errors.confirmPassword}</div>
                        )}
                    </div>
                    
                    <div className="changepass-form-group changepass-otp-group">
                        <label htmlFor="verificationCode">Mã xác thực</label>
                        <div className="changepass-input-wrapper">
                            <input
                                type="text"
                                id="verificationCode"
                                name="verificationCode"
                                value={formData.verificationCode}
                                onChange={handleChange}
                                className={`changepass-input ${errors.verificationCode ? 'changepass-input-error' : ''}`}
                                placeholder="Nhập mã OTP"
                                maxLength={6}
                                disabled={isLoading || isSendingCode}
                            />
                            <button 
                                type="button" 
                                className="changepass-otp-btn" 
                                onClick={handleSendCode} 
                                disabled={countdown > 0 || isLoading || isSendingCode}
                                data-state={isSendingCode ? 'sending' : ''}
                            >
                                {isSendingCode ? 'Đang gửi...' : 
                                  countdown > 0 ? `Gửi lại (${countdown}s)` : 'Gửi mã'}
                            </button>
                        </div>
                        {errors.verificationCode && (
                            <div className="changepass-error">{errors.verificationCode}</div>
                        )}
                    </div>
                    
                    <div className="changepass-form-actions">
                        <button 
                            type="button" 
                            className="changepass-btn-cancel" 
                            onClick={onClose}
                            disabled={isLoading || isSendingCode}
                        >
                            Hủy
                        </button>
                        <button 
                            type="submit" 
                            className="changepass-btn-submit"
                            disabled={isLoading || isSendingCode}
                            data-state={isLoading ? 'loading' : ''}
                        >
                            {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PasswordChangePopup;