import { useEffect, useMemo } from 'react';
import {
  Modal,
  Form,
  DatePicker,
  InputNumber,
  Input,
  Button,
  Alert,
  message,
  Tooltip,
  Typography,
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import type { OvertimeEmployee } from '../../../types/overtime';
import { postJSON, putJSON } from '../../../lib/http';
import '../../../../public/css/overtime/OvertimeForm.css';

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: OvertimeEmployee | null;
  onSuccess: () => void;
};

type FormVals = {
  date: Dayjs;
  hours: number;
  reason: string;
};

const BASE_PATH = '/overtimes/employees';
const { Text } = Typography;

export default function FormOvertime({
  open,
  onClose,
  initial,
  onSuccess,
}: Props) {
  const [form] = Form.useForm<FormVals>();

  const editable = useMemo(() => {
    return !initial || (initial as any)?.status === 'pending';
  }, [initial]);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      form.setFieldsValue({
        date: initial.date ? dayjs(initial.date) : undefined,
        hours:
          typeof (initial as any).hours === 'number'
            ? (initial as any).hours
            : Number((initial as any).hours || 0),
        reason: initial.reason ?? '',
      });
    } else {
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
      } else {
        await postJSON(BASE_PATH, payload);
        message.success('Đăng ký tăng ca thành công');
      }
      onSuccess();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  const disabledDate = (_: Dayjs) => false;

  return (
    <Modal
      className="ot-form-modal"
      open={open}
      title={
        <div className="ot-form-title">
          {initial ? 'Sửa tăng ca' : 'Đăng ký tăng ca'}
          {!editable && (
            <Tooltip title="Chỉ có thể chỉnh khi trạng thái là Chờ duyệt">
              <Text type="secondary" className="ms-2">
                (không thể chỉnh sửa)
              </Text>
            </Tooltip>
          )}
        </div>
      }
      onCancel={onClose}
      onOk={handleSubmit}
      okText={initial ? 'Cập nhật' : 'Tạo'}
      cancelText="Hủy"
      maskClosable={false}
      destroyOnClose
      centered
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          disabled={!editable}
        >
          {initial ? 'Cập nhật' : 'Tạo'}
        </Button>,
      ]}
    >
      {!editable && (
        <Alert
          type="info"
          className="mb-3"
          message="Bản ghi không ở trạng thái 'Chờ duyệt', không thể chỉnh sửa."
          showIcon
        />
      )}

      <Form<FormVals>
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={
          initial
            ? {
                date: initial.date ? dayjs(initial.date) : undefined,
                hours:
                  typeof (initial as any).hours === 'number'
                    ? (initial as any).hours
                    : Number((initial as any).hours || 0),
                reason: initial.reason ?? '',
              }
            : {}
        }
        disabled={!editable}
      >
        <Form.Item
          name="date"
          label="Ngày"
          rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
        >
          <DatePicker
            format="YYYY-MM-DD"
            disabledDate={disabledDate}
            className="ot-input"
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="hours"
          label="Số giờ"
          rules={[
            { required: true, message: 'Vui lòng nhập số giờ' },
            {
              validator(_, v) {
                const num = Number(v);
                if (!isFinite(num))
                  return Promise.reject('Giá trị không hợp lệ');
                if (num < 0.5) return Promise.reject('Tối thiểu 0.5 giờ');
                if (num > 24) return Promise.reject('Tối đa 24 giờ');
                return Promise.resolve();
              },
            },
          ]}
          extra={
            <Text type="secondary">
              Bước 0.5 giờ, ví dụ: 1.5 ~ 1 giờ 30 phút
            </Text>
          }
        >
          {/* ép generic về number để parser/formatter nhận kiểu number */}
          <InputNumber<number>
            className="ot-input"
            min={0.5}
            max={24}
            step={0.5}
            precision={1}
            style={{ width: '100%' }}
            formatter={(val) =>
              val === undefined || val === null ? '' : `${val} giờ`
            }
            parser={(displayValue) => {
              const n = Number(
                String(displayValue ?? '').replace(/[^\d.]/g, '')
              );
              return Number.isFinite(n) ? n : 0;
            }}
          />
        </Form.Item>

        <Form.Item
          name="reason"
          label="Lý do"
          rules={[
            { required: true, message: 'Vui lòng nhập lý do' },
            { max: 500, message: 'Tối đa 500 ký tự' },
          ]}
        >
          <Input.TextArea
            className="ot-input"
            rows={4}
            showCount
            maxLength={500}
            placeholder="Mô tả ngắn gọn công việc tăng ca…"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
