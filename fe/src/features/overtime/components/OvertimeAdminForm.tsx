import { useEffect } from 'react';
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Modal,
  message,
  Tooltip,
} from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  EditOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Overtime } from '../../../types/overtime';
import { postJSON, putJSON } from '../../../lib/http';
import '../../../../public/css/overtime/OvertimeAdminForm.css';

type Props = {
  /** null/undefined = tạo mới; có id = chỉnh sửa */
  initial?: Overtime | null;
  onSuccess: () => void;
  onCancel?: () => void;
};

type FormShape = {
  employeeId?: number | string;
  date?: dayjs.Dayjs;
  hours?: number;
  reason?: string;
};

export default function OvertimeForm({ initial, onSuccess, onCancel }: Props) {
  const [form] = Form.useForm<FormShape>();

  // Fill/reset form theo chế độ
  useEffect(() => {
    if (initial) {
      form.setFieldsValue({
        employeeId:
          (initial as any)?.employee_id ?? (initial as any)?.employeeId,
        date: initial.date ? dayjs(initial.date) : undefined,
        hours:
          typeof (initial as any)?.hours === 'number'
            ? (initial as any).hours
            : Number((initial as any)?.hours || 0),
        reason: initial.reason ?? '',
      });
    } else {
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
      } else {
        await postJSON(`/overtimes`, payload);
        message.success('Tạo mới thành công');
      }
      onSuccess();
    } catch (err: any) {
      // AntD validate sẽ ném error dạng {errorFields}, chỉ toast khi có message server
      if (err?.message) message.error(err.message);
    }
  }

  return (
    <Modal
      title={
        <div className="ot-admin__title">
          <EditOutlined />
          <span>
            {initial?.id ? 'Sửa đăng ký tăng ca' : 'Tạo đăng ký tăng ca'}
          </span>
        </div>
      }
      open={!!initial}
      onOk={handleOk}
      okText={initial?.id ? 'Lưu thay đổi' : 'Tạo mới'}
      okButtonProps={{ className: 'ot-admin__ok' }}
      onCancel={onCancel}
      cancelText="Hủy"
      maskClosable={false}
      destroyOnClose
      className="ot-admin__modal"
    >
      <div className="ot-admin__hint">
        <InfoCircleOutlined />
        <span>Điền thông tin đầy đủ và chính xác để duyệt nhanh hơn.</span>
      </div>

      <Form<FormShape>
        form={form}
        layout="vertical"
        requiredMark="optional"
        className="ot-admin__form"
        validateTrigger={['onBlur', 'onSubmit']}
      >
        <Form.Item
          name="employeeId"
          label={
            <div className="ot-admin__label">
              <UserOutlined />
              <span>Mã nhân viên</span>
              <Tooltip title="ID dạng số. Ví dụ: 1024">
                <span className="ot-admin__help">ⓘ</span>
              </Tooltip>
            </div>
          }
          rules={[
            { required: true, message: 'Nhập mã nhân viên' },
            {
              validator: (_, v) =>
                v === undefined || v === null || v === ''
                  ? Promise.resolve()
                  : isFinite(Number(v))
                    ? Promise.resolve()
                    : Promise.reject(new Error('Mã nhân viên phải là số')),
            },
          ]}
        >
          <Input
            placeholder="VD: 1024"
            inputMode="numeric"
            className="ot-admin__input"
          />
        </Form.Item>

        <div className="ot-admin__row">
          <Form.Item
            name="date"
            label={
              <div className="ot-admin__label">
                <CalendarOutlined />
                <span>Ngày tăng ca</span>
              </div>
            }
            rules={[{ required: true, message: 'Chọn ngày' }]}
            className="ot-admin__col"
          >
            <DatePicker
              className="ot-admin__picker"
              format="YYYY-MM-DD"
              placeholder="Chọn ngày"
            />
          </Form.Item>

          <Form.Item
            name="hours"
            label={
              <div className="ot-admin__label">
                <ClockCircleOutlined />
                <span>Số giờ</span>
              </div>
            }
            rules={[
              { required: true, message: 'Nhập số giờ' },
              {
                validator: (_, v) => {
                  const n = Number(v);
                  if (!isFinite(n))
                    return Promise.reject(new Error('Giá trị không hợp lệ'));
                  if (n <= 0)
                    return Promise.reject(new Error('Số giờ phải > 0'));
                  if (n > 24)
                    return Promise.reject(
                      new Error('Số giờ không vượt quá 24')
                    );
                  return Promise.resolve();
                },
              },
            ]}
            className="ot-admin__col"
          >
            <InputNumber
              min={0.5}
              max={24}
              step={0.5}
              className="ot-admin__number"
              placeholder="VD: 1.5"
              controls
            />
          </Form.Item>
        </div>

        <Form.Item
          name="reason"
          label="Lý do"
          rules={[{ required: true, message: 'Nhập lý do' }]}
        >
          <Input.TextArea
            rows={3}
            showCount
            maxLength={500}
            placeholder="Mô tả ngắn gọn lý do tăng ca…"
            className="ot-admin__textarea"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
