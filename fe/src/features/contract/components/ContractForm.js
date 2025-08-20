import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Form, Select, Input, DatePicker, InputNumber, Button, message, } from 'antd';
import dayjs from 'dayjs';
import { ContractApi, getEligibleEmployees } from '../api';
import '../../../../public/css/contract/ContractForm.css';
export default function ContractForm({ initial, onSuccess }) {
    const [form] = Form.useForm();
    const isEdit = !!initial?.id;
    const [employees, setEmployees] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    useEffect(() => {
        if (!isEdit) {
            getEligibleEmployees()
                .then(setEmployees)
                .catch(() => setEmployees([]));
        }
    }, [isEdit]);
    const employeeOptions = useMemo(() => (Array.isArray(employees) ? employees : []).map((e) => ({
        value: e.id,
        label: e.full_name || `#${e.id}`,
    })), [employees]);
    const initialValues = useMemo(() => ({
        employee_id: initial?.employee_id ?? undefined,
        contract_type: initial?.contract_type ?? '',
        start_date: initial?.start_date ? dayjs(initial.start_date) : null,
        end_date: initial?.end_date ? dayjs(initial.end_date) : null,
        salary: initial?.salary ?? null,
        status: initial?.status ?? 'valid',
    }), [initial]);
    const onFinish = async (values) => {
        try {
            setSubmitting(true);
            const payload = {
                employee_id: isEdit ? initial.employee_id : Number(values.employee_id),
                contract_type: values.contract_type ?? null,
                start_date: values.start_date
                    ? values.start_date.format('YYYY-MM-DD')
                    : null,
                end_date: values.end_date ? values.end_date.format('YYYY-MM-DD') : null,
                salary: values.salary ?? null,
                status: values.status,
            };
            if (isEdit && initial) {
                await ContractApi.update(initial.id, payload);
                message.success('Đã cập nhật hợp đồng');
            }
            else {
                await ContractApi.create(payload);
                message.success('Đã tạo hợp đồng');
            }
            onSuccess();
        }
        catch (e) {
            message.error(e?.message || 'Lưu hợp đồng thất bại');
        }
        finally {
            setSubmitting(false);
        }
    };
    return (_jsxs(Form, { form: form, layout: "vertical", initialValues: initialValues, onFinish: onFinish, children: [!isEdit && (_jsx(Form.Item, { name: "employee_id", label: "Nh\u00E2n vi\u00EAn", rules: [{ required: true, message: 'Vui lòng chọn nhân viên' }], children: _jsx(Select, { placeholder: employees === null ? 'Đang tải...' : 'Chọn nhân viên', loading: employees === null, options: employeeOptions }) })), _jsx(Form.Item, { name: "contract_type", label: "Lo\u1EA1i h\u1EE3p \u0111\u1ED3ng", children: _jsx(Input, { placeholder: "VD: Th\u1EED vi\u1EC7c / Ch\u00EDnh th\u1EE9c / CTV..." }) }), _jsx(Form.Item, { name: "start_date", label: "Ng\u00E0y b\u1EAFt \u0111\u1EA7u", children: _jsx(DatePicker, { className: "w-full" }) }), _jsx(Form.Item, { name: "end_date", label: "Ng\u00E0y k\u1EBFt th\u00FAc", children: _jsx(DatePicker, { className: "w-full" }) }), _jsx(Form.Item, { name: "salary", label: "L\u01B0\u01A1ng", children: _jsx(InputNumber, { className: "w-full", min: 0 }) }), _jsx(Form.Item, { name: "status", label: "Tr\u1EA1ng th\u00E1i", initialValue: "valid", children: _jsx(Select, { options: [
                        { value: 'valid', label: 'Còn hiệu lực' },
                        { value: 'expired', label: 'Hết hạn' },
                        { value: 'terminated', label: 'Đã chấm dứt' },
                    ] }) }), _jsx(Button, { type: "primary", htmlType: "submit", loading: submitting, block: true, children: isEdit ? 'Cập nhật' : 'Thêm mới' })] }));
}
