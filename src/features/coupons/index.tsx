import { useEffect, useMemo, useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { z } from 'zod'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { SelectDropdown } from '@/components/select-dropdown'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { ConfigDrawer } from '@/components/config-drawer'
import { ExamSelector } from '@/components/exam-selector'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  type Coupon,
  type CouponCreateRequest,
  type CouponUpdateRequest,
} from '@/types/admin'
import {
  useCouponsQuery,
  useCreateCouponMutation,
  useDeleteCouponMutation,
  useUpdateCouponMutation,
} from './api'

const couponSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  type: z.string().min(1, 'Type is required'),
  amount: z.string().optional(),
  description: z.string().optional(),
  expiresAt: z.string().optional(),
  maxUsesPerUser: z.string().optional(),
  maxUsesTotal: z.string().optional(),
  isActive: z.boolean(),
})

type CouponFormValues = z.infer<typeof couponSchema>

const couponTypeOptions = ['FLAT', 'PERCENTAGE', 'TOKEN', 'BONUS']

export function CouponsPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null)

  const { data: coupons, isLoading } = useCouponsQuery()
  const { mutateAsync: deleteCoupon, isPending: isDeleting } =
    useDeleteCouponMutation()

  const sortedCoupons = useMemo(
    () =>
      (coupons ?? []).sort((a, b) =>
        a.code.localeCompare(b.code, undefined, { sensitivity: 'base' })
      ),
    [coupons]
  )

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deleteCoupon(deleteTarget.id)
    toast.success('Coupon deleted')
    setDeleteTarget(null)
  }

  return (
    <>
      <Header fixed>
        <ExamSelector />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Coupons</h2>
            <p className='text-muted-foreground'>
              Manage promotional codes and wallet credit adjustments.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingCoupon(null)
              setFormOpen(true)
            }}
          >
            <Plus className='me-2 size-4' />
            New coupon
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coupon list</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='flex items-center gap-2 text-muted-foreground'>
                <Loader2 className='size-4 animate-spin' />
                Loading coupons...
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!sortedCoupons.length ? (
                    <TableRow>
                      <TableCell colSpan={6} className='text-center'>
                        No coupons yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedCoupons.map((coupon) => (
                      <TableRow key={coupon.id}>
                        <TableCell>
                          <div>
                            <p className='font-medium'>{coupon.code}</p>
                            <p className='text-xs text-muted-foreground'>
                              {coupon.description ?? 'No description'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{coupon.type}</TableCell>
                        <TableCell>
                          {coupon.amount != null ? coupon.amount : '—'}
                        </TableCell>
                        <TableCell>
                          {coupon.expiresAt
                            ? new Date(coupon.expiresAt).toLocaleDateString()
                            : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={coupon.isActive ? 'default' : 'outline'}
                          >
                            {coupon.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-right space-x-2'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              setEditingCoupon(coupon)
                              setFormOpen(true)
                            }}
                          >
                            <Pencil className='me-1 size-4' />
                            Edit
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='text-destructive'
                            onClick={() => setDeleteTarget(coupon)}
                          >
                            <Trash2 className='me-1 size-4' />
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Main>

      <CouponForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingCoupon(null)
        }}
        coupon={editingCoupon}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title='Delete coupon'
        desc='This will permanently remove the selected coupon.'
        destructive
        isLoading={isDeleting}
        handleConfirm={handleDelete}
        confirmText='Delete'
      />
    </>
  )
}

type CouponFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  coupon: Coupon | null
}

function CouponForm({ open, onOpenChange, coupon }: CouponFormProps) {
  const isEditing = Boolean(coupon)
  const { mutateAsync: createCoupon, isPending: isCreating } =
    useCreateCouponMutation()
  const { mutateAsync: updateCoupon, isPending: isUpdating } =
    useUpdateCouponMutation()

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema) as Resolver<CouponFormValues>,
    defaultValues: {
      code: '',
      type: 'FLAT',
      amount: '',
      description: '',
      expiresAt: '',
      maxUsesPerUser: '',
      maxUsesTotal: '',
      isActive: true,
    },
  })

  useEffect(() => {
    if (coupon) {
      form.reset({
        code: coupon.code,
        type: coupon.type,
        amount: coupon.amount?.toString() ?? '',
        description: coupon.description ?? '',
        expiresAt: coupon.expiresAt
          ? new Date(coupon.expiresAt).toISOString().slice(0, 16)
          : '',
        maxUsesPerUser: coupon.maxUsesPerUser?.toString() ?? '',
        maxUsesTotal: coupon.maxUsesTotal?.toString() ?? '',
        isActive: Boolean(coupon.isActive),
      })
    } else {
      form.reset({
        code: '',
        type: 'FLAT',
        amount: '',
        description: '',
        expiresAt: '',
        maxUsesPerUser: '',
        maxUsesTotal: '',
        isActive: true,
      })
    }
  }, [coupon, form])

  const onSubmit = async (values: CouponFormValues) => {
    const payload: CouponCreateRequest = {
      code: values.code,
      type: values.type,
      amount: values.amount ? Number(values.amount) : undefined,
      description: values.description || undefined,
      expiresAt: values.expiresAt
        ? new Date(values.expiresAt).toISOString()
        : undefined,
      maxUsesPerUser: values.maxUsesPerUser
        ? Number(values.maxUsesPerUser)
        : undefined,
      maxUsesTotal: values.maxUsesTotal
        ? Number(values.maxUsesTotal)
        : undefined,
      isActive: values.isActive,
    }

    if (isEditing && coupon) {
      await updateCoupon({ id: coupon.id, payload: payload as CouponUpdateRequest })
      toast.success('Coupon updated')
    } else {
      await createCoupon(payload)
      toast.success('Coupon created')
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit coupon' : 'Create coupon'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='code'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input placeholder='NEET50' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <SelectDropdown
                      items={couponTypeOptions.map((value) => ({
                        label: value,
                        value,
                      }))}
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select type'
                      isControlled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='amount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type='number' placeholder='Optional' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='expiresAt'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expires at</FormLabel>
                    <FormControl>
                      <Input type='datetime-local' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder='Optional description' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='maxUsesPerUser'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max uses per user</FormLabel>
                    <FormControl>
                      <Input type='number' placeholder='Optional' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='maxUsesTotal'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total max uses</FormLabel>
                    <FormControl>
                      <Input type='number' placeholder='Optional' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='isActive'
              render={({ field }) => (
                <FormItem className='flex items-center justify-between rounded-md border p-3'>
                  <div>
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      Disable to keep coupon hidden from users.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type='submit' disabled={isCreating || isUpdating}>
                {isCreating || isUpdating ? (
                  <>
                    <Loader2 className='mr-2 size-4 animate-spin' />
                    Saving
                  </>
                ) : isEditing ? (
                  'Update coupon'
                ) : (
                  'Create coupon'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
