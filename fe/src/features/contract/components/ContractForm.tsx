import { useEffect, useMemo, useState } from 'react';
import {
  Form,
  Select,
  Input,
  DatePicker,
  InputNumber,
  Button,
  message,
} from 'antd';
import dayjs from 'dayjs';
import { ContractApi, getEligibleEmployees } from '../api';
import type { Contract, EmployeeLite } from '../type';
import '../../../../public/css/contract/ContractForm.css';
type Props = {
  initial?: Contract | null; // null = create
  onSuccess: () => void;
  onCancel?: () => void; // để Modal wrapper dùng
};

export default function ContractForm({ initial, onSuccess }: Props) {
  const [form] = Form.useForm();
  const isEdit = !!initial?.id;

  const [employees, setEmployees] = useState<EmployeeLite[] | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) {
      getEligibleEmployees()
        .then(setEmployees)
        .catch(() => setEmployees([]));
    }
  }, [isEdit]);

  const employeeOptions = useMemo(
    () =>
      (Array.isArray(employees) ? employees : []).map((e) => ({
        value: e.id,
        label: e.full_name || `#${e.id}`,
      })),
    [employees]
  );

  const initialValues = useMemo(
    () => ({
      employee_id: initial?.employee_id ?? undefined,
      contract_type: initial?.contract_type ?? '',
      start_date: initial?.start_date ? dayjs(initial.start_date) : null,
      end_date: initial?.end_date ? dayjs(initial.end_date) : null,
      salary: initial?.salary ?? null,
      status: initial?.status ?? 'valid',
    }),
    [initial]
  );

  const onFinish = async (values: any) => {
    try {
      setSubmitting(true);
      const payload: Partial<Contract> = {
        employee_id: isEdit ? initial!.employee_id : Number(values.employee_id),
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
      } else {
        await ContractApi.create(payload);
        message.success('Đã tạo hợp đồng');
      }
      onSuccess();
    } catch (e: any) {
      message.error(e?.message || 'Lưu hợp đồng thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={onFinish}
    >
      {!isEdit && (
        <Form.Item
          name="employee_id"
          label="Nhân viên"
          rules={[{ required: true, message: 'Vui lòng chọn nhân viên' }]}
        >
          <Select
            placeholder={employees === null ? 'Đang tải...' : 'Chọn nhân viên'}
            loading={employees === null}
            options={employeeOptions}
          />
        </Form.Item>
      )}

      <Form.Item name="contract_type" label="Loại hợp đồng">
        <Input placeholder="VD: Thử việc / Chính thức / CTV..." />
      </Form.Item>

      <Form.Item name="start_date" label="Ngày bắt đầu">
        <DatePicker className="w-full" />
      </Form.Item>

      <Form.Item name="end_date" label="Ngày kết thúc">
        <DatePicker className="w-full" />
      </Form.Item>

      <Form.Item name="salary" label="Lương">
        <InputNumber className="w-full" min={0} />
      </Form.Item>

      <Form.Item name="status" label="Trạng thái" initialValue="valid">
        <Select
          options={[
            { value: 'valid', label: 'Còn hiệu lực' },
            { value: 'expired', label: 'Hết hạn' },
            { value: 'terminated', label: 'Đã chấm dứt' },
          ]}
        />
      </Form.Item>

      <Button type="primary" htmlType="submit" loading={submitting} block>
        {isEdit ? 'Cập nhật' : 'Thêm mới'}
      </Button>
    </Form>
  );
}
