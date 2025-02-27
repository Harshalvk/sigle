import { CheckCircledIcon } from '@radix-ui/react-icons';
import { FormikErrors, useFormik } from 'formik';
import { toast } from 'sonner';
import {
  useUserControllerGetUserMe,
  useEmailVerificationControllerAddEmail,
  useEmailVerificationControllerResendEmail,
} from '@/__generated__/sigle-api';
import {
  Box,
  Flex,
  FormHelper,
  FormHelperError,
  FormInput,
  FormLabel,
  FormRow,
} from '../../../ui';
import { isValidEmail } from '../../../utils/regex';
import { UnsavedChanges } from '../components/UnsavedChanges';
import { SettingsLayout } from '../SettingsLayout';

interface SettingsFormValues {
  email: string;
}

export const EmailData = () => {
  const { data: userMe, refetch: refetchUserMe } = useUserControllerGetUserMe(
    {},
    {
      suspense: true,
    },
  );
  const { mutate: addUserEmail, isLoading: isLoadingAddUserEmail } =
    useEmailVerificationControllerAddEmail({
      onError: (error) => {
        toast.error(error?.message);
      },
      onSuccess: async () => {
        await refetchUserMe();
        toast.success(
          'Please verify your email by clicking the link sent to your inbox.',
        );
      },
    });
  const {
    mutate: resendVerificationUserEmail,
    isLoading: isLoadingResendVerificationUserEmail,
  } = useEmailVerificationControllerResendEmail({
    onError: (error) => {
      toast.error(error?.message);
    },
    onSuccess: async () => {
      await refetchUserMe();
      toast.success(
        'Please verify your email by clicking the link sent to your inbox.',
      );
    },
  });

  // TODO emails settings preferences
  const formik = useFormik<SettingsFormValues>({
    initialValues: {
      email: userMe?.email || '',
      // receiveEmails: false,
    },
    validate: (values) => {
      const errors: FormikErrors<SettingsFormValues> = {};

      if (values.email && !isValidEmail(values.email)) {
        errors.email = 'Invalid email, enter a new one.';
      }

      return errors;
    },
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: (values, { setSubmitting }) => {
      setSubmitting(false);
      addUserEmail({
        body: {
          email: values.email,
        },
      });
    },
  });

  return (
    <SettingsLayout>
      <Box as="form" onSubmit={formik.handleSubmit} css={{ ml: 1 }}>
        <FormRow>
          <FormLabel>Email</FormLabel>
          <Flex align="center" gap="2" as="span">
            <FormInput
              name="email"
              type="email"
              maxLength={100}
              value={formik.values.email}
              onChange={formik.handleChange}
              placeholder="johndoe@gmail.com"
            />
            {!!userMe?.emailVerified && (
              <Box
                css={{
                  color: '$green11',
                }}
                as="span"
              >
                <CheckCircledIcon />
              </Box>
            )}
          </Flex>
          {formik.errors.email && (
            <FormHelperError>{formik.errors.email}</FormHelperError>
          )}
          {userMe && userMe.email && !userMe.emailVerified && (
            <FormHelper>
              Your email is not verified, please verify it.{' '}
              <Box
                as="a"
                css={{
                  color: '$orange11',
                  boxShadow: '0 1px 0 0',
                  cursor: 'pointer',
                }}
                onClick={() => resendVerificationUserEmail({})}
              >
                Resend verification email.
              </Box>
            </FormHelper>
          )}
          <FormHelper>
            Include your email <em>(optional)</em> to stay informed about
            updates and new features from us and quickly subscribe to writers.
            <br />
            Max. 100 Characters
          </FormHelper>
        </FormRow>
        {formik.dirty && (
          <UnsavedChanges
            saving={
              formik.isSubmitting ||
              isLoadingAddUserEmail ||
              isLoadingResendVerificationUserEmail
            }
          />
        )}
      </Box>
    </SettingsLayout>
  );
};
