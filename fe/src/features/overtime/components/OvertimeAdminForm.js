import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { Form, Input, InputNumber, DatePicker, Modal, message, Tooltip, } from 'antd';
import { UserOutlined, ClockCircleOutlined, CalendarOutlined, EditOutlined, InfoCircleOutlined, } from '@ant-design/icons';
import dayjs from 'dayjs';
import { postJSON, putJSON } from '../../../lib/http';
import '../../../../public/css/overtime/OvertimeAdminForm.css';
export default function OvertimeForm({ initial, onSuccess, onCancel }) {
    const [form] = Form.useForm();
    // Fill/reset form theo chế độ
    useEffect(() => {
        if (initial) {
            form.setFieldsValue({
                employeeId: initial?.employee_id ?? initial?.employeeId,
                date: initial.date ? dayjs(initial.date) : undefined,
                hours: typeof initial?.hours === 'number'
                    ? initial.hours
                    : Number(initial?.hours || 0),
                reason: initial.reason ?? '',
            });
        }
        else {
            form.resetFields();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initial]);
    async function handleOk() {
        try {
            const values = await form.validateFields();
            const payload = {
                employeeId: values.employeeId ? Number(values.employeeId) : undefined,
                date: values.date?.format('YYYY-MM-DD'),
                hours: values.hours,
                reason: values.reason?.trim() || '',
            };
            if (initial?.id) {
                await putJSON(`/overtimes/${initial.id}`, payload);
                message.success('Cập nhật thành công');
            }
            else {
                await postJSON(`/overtimes`, payload);
                message.success('Tạo mới thành công');
            }
            onSuccess();
        }
        catch (err) {
            // AntD validate sẽ ném error dạng {errorFields}, chỉ toast khi có message server
            if (err?.message)
                message.error(err.message);
        }
    }
    return (_jsxs(Modal, { title: _jsxs("div", { className: "ot-admin__title", children: [_jsx(EditOutlined, {}), _jsx("span", { children: initial?.id ? 'Sửa đăng ký tăng ca' : 'Tạo đăng ký tăng ca' })] }), open: !!initial, onOk: handleOk, okText: initial?.id ? 'Lưu thay đổi' : 'Tạo mới', okButtonProps: { className: 'ot-admin__ok' }, onCancel: onCancel, cancelText: "H\u1EE7y", maskClosable: false, destroyOnClose: true, className: "ot-admin__modal", children: [_jsxs("div", { className: "ot-admin__hint", children: [_jsx(InfoCircleOutlined, {}), _jsx("span", { children: "\u0110i\u1EC1n th\u00F4ng tin \u0111\u1EA7y \u0111\u1EE7 v\u00E0 ch\u00EDnh x\u00E1c \u0111\u1EC3 duy\u1EC7t nhanh h\u01A1n." })] }), _jsxs(Form, { form: form, layout: "vertical", requiredMark: "optional", className: "ot-admin__form", validateTrigger: ['onBlur', 'onSubmit'], children: [_jsx(Form.Item, { name: "employeeId", label: _jsxs("div", { className: "ot-admin__label", children: [_jsx(UserOutlined, {}), _jsx("span", { children: "M\u00E3 nh\u00E2n vi\u00EAn" }), _jsx(Tooltip, { title: "ID d\u1EA1ng s\u1ED1. V\u00ED d\u1EE5: 1024", children: _jsx("span", { className: "ot-admin__help", children: "\u24D8" }) })] }), rules: [
                            { required: true, message: 'Nhập mã nhân viên' },
                            {
                                validator: (_, v) => v === undefined || v === null || v === ''
                                    ? Promise.resolve()
                                    : isFinite(Number(v))
                                        ? Promise.resolve()
                                        : Promise.reject(new Error('Mã nhân viên phải là số')),
                            },
                        ], children: _jsx(Input, { placeholder: "VD: 1024", inputMode: "numeric", className: "ot-admin__input" }) }), _jsxs("div", { className: "ot-admin__row", children: [_jsx(Form.Item, { name: "date", label: _jsxs("div", { className: "ot-admin__label", children: [_jsx(CalendarOutlined, {}), _jsx("span", { children: "Ng\u00E0y t\u0103ng ca" })] }), rules: [{ required: true, message: 'Chọn ngày' }], className: "ot-admin__col", children: _jsx(DatePicker, { className: "ot-admin__picker", format: "YYYY-MM-DD", placeholder: "Ch\u1ECDn ng\u00E0y" }) }), _jsx(Form.Item, { name: "hours", label: _jsxs("div", { className: "ot-admin__label", children: [_jsx(ClockCircleOutlined, {}), _jsx("span", { children: "S\u1ED1 gi\u1EDD" })] }), rules: [
                                    { required: true, message: 'Nhập số giờ' },
                                    {
                                        validator: (_, v) => {
                                            const n = Number(v);
                                            if (!isFinite(n))
                                                return Promise.reject(new Error('Giá trị không hợp lệ'));
                                            if (n <= 0)
                                                return Promise.reject(new Error('Số giờ phải > 0'));
                                            if (n > 24)
                                                return Promise.reject(new Error('Số giờ không vượt quá 24'));
                                            return Promise.resolve();
                                        },
                                    },
                                ], className: "ot-admin__col", children: _jsx(InputNumber, { min: 0.5, max: 24, step: 0.5, className: "ot-admin__number", placeholder: "VD: 1.5", controls: true }) })] }), _jsx(Form.Item, { name: "reason", label: "L\u00FD do", rules: [{ required: true, message: 'Nhập lý do' }], children: _jsx(Input.TextArea, { rows: 3, showCount: true, maxLength: 500, placeholder: "M\u00F4 t\u1EA3 ng\u1EAFn g\u1ECDn l\u00FD do t\u0103ng ca\u2026", className: "ot-admin__textarea" }) })] })] }));
}
