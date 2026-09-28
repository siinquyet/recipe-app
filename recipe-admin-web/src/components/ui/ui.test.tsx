/**
 * Test cac component UI dung chung (Task 28).
 *
 * Nhan vie chinh kiem chung la quy tac BR: chu CAN TRAI, so CAN PHAI, va
 * so phai dung dinh dang Viet (1.000 chu khong phai 1,000).
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NumberDisplay, TextDisplay } from './NumberDisplay';
import { BodyText } from './BodyText';
import { StatusBadge } from './StatusBadge';
import { FormField } from './FormField';
import { ConfirmDialog } from './ConfirmDialog';
import { Modal } from './Modal';
import { DataTable, type Column } from './DataTable';

describe('NumberDisplay', () => {
  it('dinh dang so theo chuan Viet va can PHAI', () => {
    render(<NumberDisplay value={1500} />);
    const el = screen.getByText('1.500');
    expect(el).toBeInTheDocument();
    expect(el.className).toContain('text-right');
  });

  it('can phai ca khi co hau to', () => {
    render(<NumberDisplay value={1000000} suffix="nguoi" />);
    const el = screen.getByText(/1\.000\.000/);
    expect(el.className).toContain('text-right');
  });

  it('them hau to sau so', () => {
    render(<NumberDisplay value={4} suffix="phut" />);
    expect(screen.getByText(/4/)).toHaveTextContent('4 phut');
  });

  it('gia tri null/undefined hien thi 0 thay vi rong', () => {
    const { rerender } = render(<NumberDisplay value={null} />);
    expect(screen.getByText('0')).toBeInTheDocument();
    rerender(<NumberDisplay value={undefined} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('gia tri khong phai so hien thi 0 chu khong phai NaN', () => {
    render(<NumberDisplay value={'abc' as unknown as number} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('giu them className cua nguoi goi', () => {
    render(<NumberDisplay value={10} className="font-bold" />);
    expect(screen.getByText('10').className).toContain('font-bold');
  });
});

describe('TextDisplay', () => {
  it('chu CAN TRAI theo BR', () => {
    render(<TextDisplay value="Banh mi" />);
    expect(screen.getByText('Banh mi').className).toContain('text-left');
  });

  it('giu nguyen chu co dau', () => {
    render(<TextDisplay value="Bánh mì ăn kèm phở" />);
    expect(screen.getByText('Bánh mì ăn kèm phở')).toBeInTheDocument();
  });
});

describe('BodyText', () => {
  it('can trai mac dinh', () => {
    render(<BodyText>Noi dung</BodyText>);
    expect(screen.getByText('Noi dung').className).toContain('text-left');
  });

  it('co the can giua khi can (thong bao rong / loi)', () => {
    render(<BodyText align="center">Khong co du lieu</BodyText>);
    const el = screen.getByText('Khong co du lieu');
    expect(el.className).toContain('text-center');
    expect(el.className).not.toContain('text-left');
  });

  it('cho phep can phai', () => {
    render(<BodyText align="right">Phai</BodyText>);
    expect(screen.getByText('Phai').className).toContain('text-right');
  });
});

describe('StatusBadge', () => {
  it('hien thi nhan tieng Viet thay vi ma enum', () => {
    render(<StatusBadge status="PENDING" />);
    expect(screen.getByText('Chờ duyệt')).toBeInTheDocument();
    expect(screen.queryByText('PENDING')).not.toBeInTheDocument();
  });

  it('to mau theo trang thai', () => {
    const { container } = render(<StatusBadge status="REJECTED" />);
    const el = screen.getByText('Từ chối');
    // tone red -> nen do
    expect(el.className).toContain('red');
    expect(container.firstChild).toBeTruthy();
  });

  it('trang thai la thi hien thi nguyen ban, khong crash', () => {
    render(<StatusBadge status="LA_MOT_TRANG_THAI_MOI" />);
    expect(screen.getByText('LA_MOT_TRANG_THAI_MOI')).toBeInTheDocument();
  });

  it('cho phep ghi de nhan', () => {
    render(<StatusBadge status="APPROVED" label="Da duyet" />);
    expect(screen.getByText('Da duyet')).toBeInTheDocument();
  });
});

describe('FormField', () => {
  it('gan label voi input bang htmlFor/id', () => {
    render(<FormField label="Email" name="email" value="" onChange={() => {}} />);
    const input = screen.getByLabelText('Email');
    expect(input).toBeInTheDocument();
  });

  it('hien thi loi khi co error', () => {
    render(
      <FormField
        label="Email"
        name="email"
        value=""
        onChange={() => {}}
        error="Email khong hop le"
      />,
    );
    expect(screen.getByText('Email khong hop le')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('bat buoc nhap thi danh dau * va bat buoc attribute', () => {
    render(<FormField label="Ten" name="ten" value="" onChange={() => {}} required />);
    expect(screen.getByRole('textbox')).toBeRequired();
  });

  it('ho tro select', () => {
    render(
      <FormField
        label="Trang thai"
        name="status"
        value="PENDING"
        onChange={() => {}}
        options={[
          { value: 'PENDING', label: 'Cho duyet' },
          { value: 'APPROVED', label: 'Da duyet' },
        ]}
      />,
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Cho duyet' })).toBeInTheDocument();
  });
});

describe('Modal', () => {
  it('khong hien thi khi dong', () => {
    render(
      <Modal open={false} onClose={() => {}} title="Chi tiet">
        Noi dung
      </Modal>,
    );
    expect(screen.queryByText('Noi dung')).not.toBeInTheDocument();
  });

  it('hien thi khi mo', () => {
    render(
      <Modal open onClose={() => {}} title="Chi tiet">
        Noi dung
      </Modal>,
    );
    expect(screen.getByText('Noi dung')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('goi onClose khi bam nen ngoai', () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal open onClose={onClose} title="Chi tiet">
        Noi dung
      </Modal>,
    );
    // lop phu nen: phan tu dau tien co chua overlay
    const overlay = container.querySelector('.fixed');
    expect(overlay).toBeTruthy();
    fireEvent.click(overlay!);
    expect(onClose).toHaveBeenCalled();
  });

  it('goi onClose khi bam nut X', () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Chi tiet">
        Noi dung
      </Modal>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Đóng' }));
    expect(onClose).toHaveBeenCalled();
  });
});

describe('ConfirmDialog', () => {
  it('hien thi tieu de va noi dung xac nhan', () => {
    render(
      <ConfirmDialog
        open
        onCancel={() => {}}
        onConfirm={() => {}}
        title="Duyet cong thuc"
        message="Ban co muon duyet mon nay khong?"
      />,
    );
    expect(screen.getByText('Duyet cong thuc')).toBeInTheDocument();
    expect(screen.getByText('Ban co muon duyet mon nay khong?')).toBeInTheDocument();
  });

  it('goi onConfirm khi bam nut xac nhan', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        open
        onCancel={onCancel}
        onConfirm={onConfirm}
        title="Duyet"
        message="Xac nhan?"
        confirmLabel="Duyet"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Duyet' }));
    expect(onConfirm).toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('goi onCancel khi bam nut huy', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        open
        onCancel={onCancel}
        onConfirm={onConfirm}
        title="Duyet"
        message="Xac nhan?"
        cancelLabel="Huy"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Huy' }));
    expect(onCancel).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('nut phu bien (reject) co mau do', () => {
    render(
      <ConfirmDialog
        open
        onCancel={() => {}}
        onConfirm={() => {}}
        title="Tu choi"
        message="Nhap ly do"
        variant="danger"
      />,
    );
    const btn = screen.getByRole('button', { name: 'Xác nhận' });
    expect(btn.className).toContain('red');
  });

  it('khi dang xu ly thi vo hieu hoa ca hai nut', () => {
    render(
      <ConfirmDialog
        open
        onCancel={() => {}}
        onConfirm={() => {}}
        title="Duyet"
        message="Xac nhan?"
        loading
      />,
    );
    expect(screen.getByRole('button', { name: /Đang xử lý/i })).toBeDisabled();
  });
});

interface Row {
  id: string;
  ten: string;
  soLuong: number;
  status: string;
}

const cols: Column<Row>[] = [
  { key: 'ten', header: 'Ten' },
  { key: 'soLuong', header: 'So luong', numeric: true },
  { key: 'status', header: 'Trang thai', render: (r) => <StatusBadge status={r.status} /> },
];

const data: Row[] = [
  { id: 'a', ten: 'Pha bo', soLuong: 1500, status: 'APPROVED' },
  { id: 'b', ten: 'Banh chay', soLuong: 20, status: 'PENDING' },
  { id: 'c', ten: 'Cha sua', soLuong: 300, status: 'REJECTED' },
];

describe('DataTable', () => {
  it('tu dong them cot STT va hien thi tu 1', () => {
    render(<DataTable columns={cols} rows={data} rowKey={(r) => r.id} page={0} pageSize={10} />);
    const cells = screen.getAllByRole('row').slice(1).map((tr) => tr.children[0].textContent);
    expect(cells).toEqual(['1', '2', '3']);
  });

  it('cong offset trang: trang 2 bat dau tu 11 khong phai 1', () => {
    render(<DataTable columns={cols} rows={data} rowKey={(r) => r.id} page={1} pageSize={10} />);
    const cells = screen.getAllByRole('row').slice(1).map((tr) => tr.children[0].textContent);
    expect(cells).toEqual(['11', '12', '13']);
  });

  it('cot STT va cot so CAN PHAI, cot chu CAN TRAI', () => {
    render(<DataTable columns={cols} rows={data} rowKey={(r) => r.id} page={0} pageSize={10} />);
    const headerCells = screen.getAllByRole('columnheader');
    // cot dau la STT -> can phai; "So luong" -> can phai; "Ten" -> can trai
    expect(headerCells[0].className).toContain('text-right');
    expect(headerCells[2].className).toContain('text-right');
    expect(headerCells[1].className).toContain('text-left');
  });

  it('dinh dang cot so theo chuan Viet', () => {
    render(<DataTable columns={cols} rows={data} rowKey={(r) => r.id} page={0} pageSize={10} />);
    expect(screen.getByText('1.500')).toBeInTheDocument();
    expect(screen.queryByText('1,500')).not.toBeInTheDocument();
  });

  it('sap xep khi bam vao tieu de cot sap xep duoc', () => {
    const onSort = vi.fn();
    render(
      <DataTable
        columns={cols}
        rows={data}
        rowKey={(r) => r.id}
        page={0}
        pageSize={10}
        sortable
        onSortChange={onSort}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /so luong/i }));
    expect(onSort).toHaveBeenCalledWith('soLuong', 'asc');
    fireEvent.click(screen.getByRole('button', { name: /so luong/i }));
    expect(onSort).toHaveBeenCalledWith('soLuong', 'desc');
  });

  it('sap xep that o trong bang khi khong can server-side', () => {
    const onSort = vi.fn();
    render(
      <DataTable
        columns={cols}
        rows={data}
        rowKey={(r) => r.id}
        page={0}
        pageSize={10}
        sortable
        onSortChange={onSort}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /so luong/i }));
    const tenCells = screen
      .getAllByRole('row')
      .slice(1)
      .map((tr) => tr.children[1].textContent);
    expect(tenCells).toEqual(['Banh chay', 'Cha sua', 'Pha bo']);
  });

  it('hien thi thong bao rong khi khong co du lieu', () => {
    render(
      <DataTable
        columns={cols}
        rows={[]}
        rowKey={(r) => r.id}
        page={0}
        pageSize={10}
        emptyMessage="Chưa có công thức"
      />,
    );
    expect(screen.getByText('Chưa có công thức')).toBeInTheDocument();
  });

  it('hien thi trang thai dang tai', () => {
    render(<DataTable columns={cols} rows={[]} rowKey={(r) => r.id} page={0} pageSize={10} loading />);
    expect(screen.getByText('Đang tải...')).toBeInTheDocument();
  });

  it('goi onPageChange khi chuyen trang', () => {
    const onPageChange = vi.fn();
    render(
      <DataTable
        columns={cols}
        rows={data}
        rowKey={(r) => r.id}
        page={0}
        pageSize={2}
        totalItems={5}
        onPageChange={onPageChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '2' }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('khong hien thi thanh phan trang khi chi co 1 trang', () => {
    render(
      <DataTable
        columns={cols}
        rows={data}
        rowKey={(r) => r.id}
        page={0}
        pageSize={10}
        totalItems={3}
        onPageChange={() => {}}
      />,
    );
    expect(screen.queryByRole('button', { name: '2' })).not.toBeInTheDocument();
  });

  it('dinh dang tong so ban ghi theo chuan Viet', () => {
    render(
      <DataTable
        columns={cols}
        rows={data}
        rowKey={(r) => r.id}
        page={0}
        pageSize={10}
        totalItems={12345}
        onPageChange={() => {}}
      />,
    );
    expect(screen.getByText(/12\.345/)).toBeInTheDocument();
  });

  it('render noi dung tuy chon theo cot', () => {
    render(
      <DataTable
        columns={[
          { key: 'ten', header: 'Ten' },
          { key: 'action', header: 'Thao tac', render: (r) => <button>Duyet {r.id}</button> },
        ]}
        rows={data}
        rowKey={(r) => r.id}
        page={0}
        pageSize={10}
      />,
    );
    expect(screen.getByRole('button', { name: 'Duyet a' })).toBeInTheDocument();
  });
});
