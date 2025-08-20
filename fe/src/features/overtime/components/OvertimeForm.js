import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo } from 'react';
import { Modal, Form, DatePicker, InputNumber, Input, Button, Alert, message, Tooltip, Typography, } from 'antd';
import dayjs from 'dayjs';
import { postJSON, putJSON } from '../../../lib/http';
import '../../../../public/css/overtime/OvertimeForm.css';
const BASE_PATH = '/overtimes/employees';
const { Text } = Typography;
export default function FormOvertime({ open, onClose, initial, onSuccess, }) {
    const [form] = Form.useForm();
    const editable = useMemo(() => {
        return !initial || initial?.status === 'pending';
    }, [initial]);
    useEffect(() => {
        if (!open)
            return;
        if (initial) {
            form.setFieldsValue({
                date: initial.date ? dayjs(initial.date) : undefined,
                hours: typeof initial.hours === 'number'
                    ? initial.hours
                    : Number(initial.hours || 0),
                reason: initial.reason ?? '',
            });
        }
        else {
            form.resetFields();
        }
    }, [open, initial, form]);
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                ...values,
                date: values.date.format('YYYY-MM-DD'),
                hours: Number(values.hours) || 0,
            };
            if (initial) {
                await putJSON(`${BASE_PATH}/${initial.id}`, payload);
                message.success('Cập nhật tăng ca thành công');
            }
            else {
                await postJSON(BASE_PATH, payload);
                message.success('Đăng ký tăng ca thành công');
            }
            onSuccess();
        }
        catch (err) {
            if (err?.errorFields)
                return;
            message.error(err?.message || 'Có lỗi xảy ra, vui lòng thử lại');
        }
    };
    const disabledDate = (_) => false;
    return (_jsxs(Modal, { className: "ot-form-modal", open: open, title: _jsxs("div", { className: "ot-form-title", children: [initial ? 'Sửa tăng ca' : 'Đăng ký tăng ca', !editable && (_jsx(Tooltip, { title: "Ch\u1EC9 c\u00F3 th\u1EC3 ch\u1EC9nh khi tr\u1EA1ng th\u00E1i l\u00E0 Ch\u1EDD duy\u1EC7t", children: _jsx(Text, { type: "secondary", className: "ms-2", children: "(kh\u00F4ng th\u1EC3 ch\u1EC9nh s\u1EEDa)" }) }))] }), onCancel: onClose, onOk: handleSubmit, okText: initial ? 'Cập nhật' : 'Tạo', cancelText: "H\u1EE7y", maskClosable: false, destroyOnClose: true, centered: true, footer: [
            _jsx(Button, { onClick: onClose, children: "H\u1EE7y" }, "cancel"),
            _jsx(Button, { type: "primary", onClick: handleSubmit, disabled: !editable, children: initial ? 'Cập nhật' : 'Tạo' }, "submit"),
        ], children: [!editable && (_jsx(Alert, { type: "info", className: "mb-3", message: "B\u1EA3n ghi kh\u00F4ng \u1EDF tr\u1EA1ng th\u00E1i 'Ch\u1EDD duy\u1EC7t', kh\u00F4ng th\u1EC3 ch\u1EC9nh s\u1EEDa.", showIcon: true })), _jsxs(Form, { form: form, layout: "vertical", onFinish: handleSubmit, initialValues: initial
                    ? {
                        date: initial.date ? dayjs(initial.date) : undefined,
                        hours: typeof initial.hours === 'number'
                            ? initial.hours
                            : Number(initial.hours || 0),
                        reason: initial.reason ?? '',
                    }
                    : {}, disabled: !editable, children: [_jsx(Form.Item, { name: "date", label: "Ng\u00E0y", rules: [{ required: true, message: 'Vui lòng chọn ngày' }], children: _jsx(DatePicker, { format: "YYYY-MM-DD", disabledDate: disabledDate, className: "ot-input", style: { width: '100%' } }) }), _jsx(Form.Item, { name: "hours", label: "S\u1ED1 gi\u1EDD", rules: [
                            { required: true, message: 'Vui lòng nhập số giờ' },
                            {
                                validator(_, v) {
                                    const num = Number(v);
                                    if (!isFinite(num))
                                        return Promise.reject('Giá trị không hợp lệ');
                                    if (num < 0.5)
                                        return Promise.reject('Tối thiểu 0.5 giờ');
                                    if (num > 24)
                                        return Promise.reject('Tối đa 24 giờ');
                                    return Promise.resolve();
                                },
                            },
                        ], extra: _jsx(Text, { type: "secondary", children: "B\u01B0\u1EDBc 0.5 gi\u1EDD, v\u00ED d\u1EE5: 1.5 ~ 1 gi\u1EDD 30 ph\u00FAt" }), children: _jsx(InputNumber, { className: "ot-input", min: 0.5, max: 24, step: 0.5, precision: 1, style: { width: '100%' }, formatter: (val) => val === undefined || val === null ? '' : `${val} giờ`, parser: (displayValue) => {
                                const n = Number(String(displayValue ?? '').replace(/[^\d.]/g, ''));
                                return Number.isFinite(n) ? n : 0;
                            } }) }), _jsx(Form.Item, { name: "reason", label: "L\u00FD do", rules: [
                            { required: true, message: 'Vui lòng nhập lý do' },
                            { max: 500, message: 'Tối đa 500 ký tự' },
                        ], children: _jsx(Input.TextArea, { className: "ot-input", rows: 4, showCount: true, maxLength: 500, placeholder: "M\u00F4 t\u1EA3 ng\u1EAFn g\u1ECDn c\u00F4ng vi\u1EC7c t\u0103ng ca\u2026" }) })] })] }));
}
